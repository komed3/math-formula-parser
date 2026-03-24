/**
 * Parser is responsible for converting a sequence of tokens into an Abstract Syntax Tree (AST).
 * 
 * It uses a recursive descent parsing algorithm with precedence climbing for binary operators.
 * It handles operator precedence, associativity, function calls, and various mathematical notations.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { OperatorSpec, Token } from './types';
import { ASTNode } from './ast';
import { CONSTANTS, FUNCTION_ALIASES, IMPLICIT_MULTIPLICATION_TOKENS, OPERATOR_BY_SYMBOL, OPERATOR_BY_TOKEN } from './definitions';
import { FUNCTION_BUILDERS } from './formatter';
import { TokenType } from './types';


/**
 * The Parser class takes an array of tokens and builds an AST.
 */
export class Parser {

    /** The current index in the token array. */
    private current = 0;

    /**
     * Creates a new Parser instance.
     * 
     * @param {Token[]} tokens - The array of tokens to parse.
     */
    constructor ( private readonly tokens: Token[] ) {}

    /**
     * Recursively parses a mathematical expression based on operator precedence.
     * 
     * @param {number} [minPrecedence=0] - The minimum precedence level to consider.
     * @returns {ASTNode} The root node of the parsed expression sub-tree.
     */
    private parseExpression ( minPrecedence = 0 ) : ASTNode {
        let left = this.parseUnary();

        while ( true ) {
            const token = this.peek();
            const op = this.getOperator( token );

            if ( ! op || op.precedence < minPrecedence ) {
                if ( this.canImplicitMultiply( token ) ) {
                    left = new ASTNode( 'binary', { operator: '*', left, right: this.parseUnary() }, token.position );
                    continue;
                }

                break;
            }

            this.advance();
            const nextMin = op.associativity === 'left' ? op.precedence + 1 : op.precedence;
            const right = this.parseExpression( nextMin );
            left = new ASTNode( 'binary', { operator: op.symbol, left, right }, token.position );
        }

        return left;
    }

    /**
     * Parses a unary expression (e.g., +x, -y, !z).
     * 
     * @returns {ASTNode} The root node of the unary expression sub-tree.
     */
    private parseUnary () : ASTNode {
        if ( this.match( TokenType.PLUS, TokenType.MINUS, TokenType.NOT ) ) {
            const op = this.prev().value;
            const operand = this.parseUnary();

            return new ASTNode( 'unary', { operator: op, operand }, this.prev().position );
        }

        const expr = this.parsePrimary();
        return this.parsePostfix( expr );
    }

    /**
     * Parses a primary expression (numbers, identifiers, parentheses, etc.).
     * 
     * @returns {ASTNode} The root node of the primary expression.
     * @throws {Error} If no valid primary expression is found.
     */
    private parsePrimary () : ASTNode {
        if ( this.match( TokenType.NUMBER ) ) {
            const tok = this.prev();
            return new ASTNode( 'number', { value: Number( tok.value ) }, tok.position );
        }

        if ( this.match( TokenType.IDENTIFIER ) ) {
            const tok = this.prev();
            const name = tok.value;

            if ( this.check( TokenType.LPAREN ) ) {
                return this.parseFunctionCall( name, tok.position );
            }

            if ( name in CONSTANTS ) return new ASTNode( 'constant', { name, value: CONSTANTS[ name ] }, tok.position );
            return new ASTNode( 'identifier', { name }, tok.position );
        }

        if ( this.match( TokenType.LPAREN ) ) {
            const expr = this.parseExpression();
            this.consume( TokenType.RPAREN, 'Expected )' );
            return new ASTNode( 'group', { expression: expr }, this.prev().position );
        }

        if ( this.match( TokenType.LBRACKET ) ) return this.parseVectorOrRange();

        throw this.error( 'Expected expression' );
    }

    /**
     * Parses postfix expressions like factorials, indices, or subscripts.
     * 
     * @param {ASTNode} node - The base node to attach postfix operators to.
     * @returns {ASTNode} The modified node with postfix operators applied.
     */
    private parsePostfix ( node: ASTNode ) : ASTNode {
        while ( true ) {
            if ( this.match( TokenType.NOT ) ) {
                node = new ASTNode( 'factorial', { operand: node }, this.prev().position );
                continue;
            }

            if ( this.match( TokenType.ELLIPSIS ) ) {
                const right = this.parseExpression();
                node = new ASTNode( 'ellipsis', { left: node, right }, this.prev().position );
                continue;
            }

            if ( this.match( TokenType.LBRACKET ) ) {
                const index = this.parseExpression();
                this.consume( TokenType.RBRACKET, 'Expected ]' );
                node = new ASTNode( 'index', { base: node, index }, this.prev().position );
                continue;
            }

            if ( this.match( TokenType.UNDER ) ) {
                const subscript = this.parseExpression();
                node = new ASTNode( 'subscript', { base: node, subscript }, this.prev().position );
                continue;
            }

            break;
        }

        return node;
    }

    /**
     * Parses a function call including its arguments.
     * 
     * @param {string} name - The name of the function being called.
     * @param {Position} position - The starting position of the function call.
     * @returns {ASTNode} The AST node representing the function call.
     */
    private parseFunctionCall ( name: string, position: Token[ 'position' ] ) : ASTNode {
        this.consume( TokenType.LPAREN, 'Expected (' );

        if ( name === 'matrix' ) {
            const matrix = this.parseMatrix();
            this.consume( TokenType.RPAREN, 'Expected )' );
            return matrix;
        }

        const args: ASTNode[] = [];

        if ( ! this.check( TokenType.RPAREN ) ) {
            do { args.push( this.parseExpression() ) }
            while ( this.match( TokenType.COMMA ) );
        }

        this.consume( TokenType.RPAREN, 'Expected )' );

        const canonical = FUNCTION_ALIASES[ name ] ?? name;
        const createNode = ( kind: string, props: Record< string, any >, pos?: Token[ 'position' ] ) => new ASTNode( kind, props, pos );
        const builder = FUNCTION_BUILDERS[ canonical ];

        return builder ? builder( createNode, args, position ) : createNode( 'function', { name: canonical, args }, position );
    }

    /**
     * Parses a matrix structure within a 'matrix(...)' function call.
     * 
     * @returns {ASTNode} The AST node representing the matrix.
     */
    private parseMatrix () : ASTNode {
        const rows: ASTNode[][] = [];
        let row: ASTNode[] = [];

        while ( ! this.check( TokenType.RPAREN ) && ! this.isAtEnd() ) {
            row.push( this.parseExpression() );

            if ( this.match( TokenType.COMMA ) ) continue;
            if ( this.match( TokenType.SEMICOLON ) ) {
                rows.push( row ); row = [];
                continue;
            }

            break;
        }

        rows.push( row );

        return new ASTNode( 'matrix', { rows }, this.peek().position );
    }

    /**
     * Parses a vector or range enclosed in square brackets.
     * 
     * @returns {ASTNode} The AST node representing the vector or range.
     */
    private parseVectorOrRange () : ASTNode {
        const start = this.prev().position;
        const items: ASTNode[] = [];

        while ( ! this.check( TokenType.RBRACKET ) && ! this.isAtEnd() ) {
            items.push( this.parseExpression() );
            if ( ! this.match( TokenType.COMMA ) ) break;
        }

        this.consume( TokenType.RBRACKET, 'Expected ]' );

        if ( items.length === 2 ) return new ASTNode( 'range', {
          lower: items[ 0 ], upper: items[ 1 ], lowerInclusive: true, upperInclusive: true
        }, start );

        return new ASTNode( 'vector', { elements: items }, start );
    }

    /**
     * Helper to retrieve the operator specification for a given token.
     * 
     * @param {Token} token - The token to check.
     * @returns {OperatorSpec | undefined} The operator specification if found.
     */
    private getOperator ( token: Token ) : OperatorSpec | undefined {
        if ( token.type === TokenType.EOF ) return undefined;
        return OPERATOR_BY_TOKEN.get( token.type ) ?? OPERATOR_BY_SYMBOL.get( token.value );
    }

    /**
     * Checks if a token can trigger implicit multiplication (e.g., 2(x)).
     * 
     * @param {Token} token - The token to check.
     * @returns {boolean} True if implicit multiplication is possible.
     */
    private canImplicitMultiply ( token: Token ) : boolean {
        return IMPLICIT_MULTIPLICATION_TOKENS.has( token.type );
    }

    /**
     * Checks if the current token matches any of the given types, and advances if it does.
     * 
     * @param {TokenType[]} types - The token types to match against.
     * @returns {boolean} True if a match was found and the current index advanced.
     */
    private match ( ...types: TokenType[] ) : boolean {
        for ( const t of types ) if ( this.check( t ) ) {
            this.advance();
            return true;
        }

        return false;
    }

    /**
     * Checks if the current token corresponds to a specific type.
     * 
     * @param {TokenType} type - The token type to check.
     * @returns {boolean} True if the current token matches the type.
     */
    private check ( type: TokenType ) : boolean {
        return ! this.isAtEnd() && this.peek().type === type;
    }

    /**
     * Advances the current pointer and returns the newly reached token.
     * 
     * @returns {Token} The previously current token.
     */
    private advance () : Token {
        if ( ! this.isAtEnd() ) this.current++;
        return this.prev();
    }

    /**
     * Returns the token just before the current one.
     * 
     * @returns {Token} The previous token.
     */
    private prev () : Token {
        return this.tokens[ this.current - 1 ];
    }

    /**
     * Returns the current token without advancing.
     * 
     * @returns {Token} The current token.
     */
    private peek () : Token {
        return this.tokens[ this.current ];
    }

    /**
     * Checks if the end of the token stream has been reached.
     * 
     * @returns {boolean} True if at end, false otherwise.
     */
    private isAtEnd () : boolean {
        return this.peek().type === TokenType.EOF;
    }

    /**
     * Expects a specific token type and consumes it, otherwise throws an error.
     * 
     * @param {TokenType} type - The required token type.
     * @param {string} msg - The error message to throw if the type doesn't match.
     * @returns {Token} The consumed token.
     * @throws {Error} If the expected token type is not found.
     */
    private consume ( type: TokenType, msg: string ) : Token {
        if ( this.check( type ) ) return this.advance();
        throw this.error( msg );
    }

    /**
     * Creates and returns a new Error object with position information.
     * 
     * @param {string} msg - The error message.
     * @returns {Error} The error object.
     */
    private error ( msg: string ) : Error {
        const t = this.peek();
        return new Error( `${msg} at ${t.position.line}:${t.position.column}` );
    }


    /**
     * Starts the parsing process and returns the final AST.
     * 
     * @returns {ASTNode} The root node of the generated AST.
     * @throws {Error} If the input formula is invalid or contains trailing tokens.
     */
    public parse () : ASTNode {
        const root = this.parseExpression();
        if ( ! this.isAtEnd() ) throw this.error( 'Unexpected token after expression' );

        return root;
    }

}
