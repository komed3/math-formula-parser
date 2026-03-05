import type { ASTNode, Token } from './types';
import * as AST from './ast';
import { MATH_CONSTANTS } from './constants';
import { TokenType } from './types';

export class Parser {

    private current = 0;

    constructor ( private tokens: Token[] ) {}

    public parse () : ASTNode {
        const expr = this.assignment();

        if ( ! this.isAtEnd() ) throw this.error( 'Unexpected token after expression' );
        return expr;
    }

    private assignment () : ASTNode {
        const expr = this.logicalOr();

        if ( this.match( TokenType.EQUAL ) ) {
            const value = this.assignment();

            if ( expr instanceof AST.VariableNode ) return new AST.BinaryOpNode( '=', expr, value );
            throw this.error( 'Invalid assignment' );
        }

        return expr;
    }

    private logicalOr () : ASTNode {
        let expr = this.logicalAnd();

        while ( this.match( TokenType.OR ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.logicalAnd() );
        }

        return expr;
    }

    private logicalAnd () : ASTNode {
        let expr = this.equality();

        while ( this.match( TokenType.AND ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.equality() );
        }

        return expr;
    }

    private equality () : ASTNode {
        let expr = this.comparison();

        while ( this.match( TokenType.EQUAL, TokenType.NOT_EQUAL ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.comparison() );
        }

        return expr;
    }

    private comparison () : ASTNode {
        let expr = this.ellipsis();

        while ( this.match( TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.ellipsis() );
        }

        return expr;
    }

    private ellipsis () : ASTNode {
        let expr = this.additive();

        while ( this.match( TokenType.ELLIPSIS ) ) {
            expr = new AST.EllipsisNode( expr, this.additive(), this.prev().position );
        }

        return expr;
    }

    private additive () : ASTNode {
        let expr = this.multiplicative();

        while ( this.match( TokenType.PLUS, TokenType.MINUS ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.multiplicative() );
        }

        return expr;
    }

    private multiplicative () : ASTNode {
        let expr = this.exponential();

        while ( this.match( TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO ) ) {
            expr = new AST.BinaryOpNode( this.prev().value, expr, this.exponential() );
        }

        while ( this.canStartPrimary() ) {
            expr = new AST.BinaryOpNode( '*', expr, this.exponential() );
        }

        return expr;
    }

    private exponential () : ASTNode {
        let expr = this.unary();

        if ( this.match( TokenType.POWER ) ) {
            expr = new AST.PowerNode( expr, this.exponential() );
        }

        return expr;
    }

    private unary () : ASTNode {
        if ( this.match( TokenType.PLUS, TokenType.MINUS, TokenType.NOT ) ) {
            return new AST.UnaryOpNode( this.prev().value, this.unary() );
        }

        return this.postfix();
    }

    private postfix () : ASTNode {
        let expr = this.primary();

        while ( true ) {
            if ( this.match( TokenType.NOT ) ) {
                expr = new AST.FactorialNode( expr, this.prev().position );
                continue;
            }

            if ( this.match( TokenType.UNDER ) ) {
                expr = new AST.SubscriptNode( expr, this.primary(), this.prev().position );
                continue;
            }

            break;
        }

        return expr;
    }

    private primary () : ASTNode {
        if ( this.match( TokenType.NUMBER ) ) {
            return new AST.NumberNode( Number( this.prev().value ), this.prev().position );
        }

        if ( this.match( TokenType.IDENTIFIER ) ) {
            const name = this.prev().value;
            const pos = this.prev().position;

            if ( name in MATH_CONSTANTS ) {
                return new AST.ConstantNode( name, MATH_CONSTANTS[ name ], pos );
            }

            if ( this.check( TokenType.LPAREN ) ) {
                return this.finishFunction( name, pos );
            }

            return new AST.VariableNode( name, pos );
        }

        if ( this.match( TokenType.LPAREN ) ) {
            this.consume( TokenType.RPAREN, 'Expected ")"' );
            return new AST.GroupNode( this.assignment(), this.prev().position );
        }

        if ( this.match( TokenType.LBRACKET ) ) {
            return this.parseVector();
        }

        throw this.error( 'Expected expression' );
    }

    private parseVector () : ASTNode {
        const pos = this.prev().position;

        if ( this.check( TokenType.LBRACKET ) ) {
            const rows: ASTNode[][] = [];

            do {
                this.consume( TokenType.LBRACKET, 'Expected "["' );
                const row = this.parseVectorElements();
                rows.push( row );
            } while ( this.match( TokenType.COMMA ) && this.check( TokenType.LBRACKET ) );

            this.consume( TokenType.RBRACKET, 'Expected "]"' );
            return new AST.MatrixNode( rows, pos );
        }

        const elements: ASTNode[] = [];

        if ( ! this.check( TokenType.RBRACKET ) ) {
            do { elements.push( this.assignment() ) }
            while (
                this.match( TokenType.COMMA ) && ! this.check( TokenType.RBRACKET ) &&
                ! this.check( TokenType.RPAREN ) && ! this.check( TokenType.LPAREN )
            );
        }

        if ( elements.length === 2 && ( this.check( TokenType.RPAREN ) || this.check( TokenType.LPAREN ) ) ) {
            return new AST.RangeNode( elements[ 0 ], elements[ 1 ], true, false, pos );
        }

        this.consume( TokenType.RBRACKET, 'Expected "]"' );
        return new AST.VectorNode( elements, pos );
    }

    private parseVectorElements () : ASTNode[] {
        const elements: ASTNode[] = [];

        if ( ! this.check( TokenType.RBRACKET ) ) {
            do { elements.push( this.assignment() ) }
            while ( this.match( TokenType.COMMA ) && ! this.check( TokenType.RBRACKET ) );
        }

        this.consume( TokenType.RBRACKET, 'Expected "]"' );
        return elements;
    }

    private finishFunction ( name: string, pos: any ) : ASTNode {
        this.consume( TokenType.LPAREN, 'Expected "("' );
        const args: ASTNode[] = [];

        if ( ! this.check( TokenType.RPAREN ) ) {
            do { args.push( this.assignment() ) }
            while ( this.match( TokenType.COMMA ) );
        }

        this.consume( TokenType.RPAREN, 'Expected ")"' );

        if ( name === 'sqrt' ) {
            if ( args.length === 1 ) return new AST.SqrtNode( args[ 0 ], undefined, pos );
            if ( args.length === 2 ) return new AST.SqrtNode( args[ 0 ], args[ 1 ], pos );
        }

        if ( name === 'integral' ) {
            const varName = this.extractVarName( args[ 1 ] );
            if ( args.length === 2 ) {
                return new AST.IntegralNode( varName, args[ 0 ], undefined, undefined, pos );
            } else if ( args.length === 4 ) {
                return new AST.IntegralNode( varName, args[ 0 ], args[ 2 ], args[ 3 ], pos );
            }
        }

        if ( ( name === 'sum' || name === 'Σ' ) && args.length === 4 ) {
            return new AST.SummationNode( this.extractVarName( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], pos );
        }

        if ( ( name === 'product' || name === 'Π' ) && args.length === 4 ) {
            return new AST.ProductNode( this.extractVarName( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], pos );
        }

        if ( ( name === 'derivative' || name === 'd' || name === 'dx' ) && args.length === 2 ) {
            return new AST.DerivativeNode( this.extractVarName( args[ 1 ] ), args[ 0 ], pos );
        }

        if ( ( name === 'partial' || name === '∂' ) && args.length === 2 ) {
            return new AST.PartialDerivativeNode( this.extractVarName( args[ 1 ] ), args[ 0 ], pos );
        }

        return new AST.FunctionNode( name, args, pos );
    }

    private extractVarName ( node: ASTNode ) : string {
        if ( node instanceof AST.VariableNode || node instanceof AST.ConstantNode ) return node.name;
        return 'x';
    }

    private match ( ...types: TokenType[] ) : boolean {
        for ( const t of types ) if ( this.check( t ) ) {
            this.advance();
            return true;
        }

        return false;
    }

    private check ( type: TokenType ) : boolean {
        return ! this.isAtEnd() && this.peek().type === type;
    }

    private advance () : Token {
        if ( ! this.isAtEnd() ) this.current++;
        return this.prev();
    }

    private prev () : Token {
        return this.tokens[ this.current - 1 ];
    }

    private peek () : Token {
        return this.tokens[ this.current ];
    }

    private isAtEnd () : boolean {
        return this.peek().type === TokenType.EOF;
    }

    private error ( msg: string ) : Error {
        const t = this.peek();
        return new Error( `${msg} at ${t.position.line}:${t.position.column}` );
    }

}
