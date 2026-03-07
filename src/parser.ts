import type { OperatorSpec, Token } from './types';
import { ASTNode } from './ast';
import { CONSTANTS, FUNCTION_ALIASES, IMPLICIT_MULTIPLICATION_TOKENS, OPERATOR_BY_SYMBOL, OPERATOR_BY_TOKEN } from './definitions';
import { FUNCTION_BUILDERS } from './formatter';
import { TokenType } from './types';


export class Parser {

    private current = 0;

    constructor ( private readonly tokens: Token[] ) {}

    public parse () : ASTNode {
        const root = this.parseExpression();
        if ( ! this.isAtEnd() ) throw this.error( 'Unexpected token after expression' );

        return root;
    }

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

    private parseUnary () : ASTNode {
        if ( this.match( TokenType.PLUS, TokenType.MINUS, TokenType.NOT ) ) {
            const op = this.prev().value;
            const operand = this.parseUnary();

            return new ASTNode( 'unary', { operator: op, operand }, this.prev().position );
        }

        const expr = this.parsePrimary();
        return this.parsePostfix( expr );
    }

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

    private getOperator ( token: Token ) : OperatorSpec | undefined {
        if ( token.type === TokenType.EOF ) return undefined;
        return OPERATOR_BY_TOKEN.get( token.type ) ?? OPERATOR_BY_SYMBOL.get( token.value );
    }

    private canImplicitMultiply ( token: Token ) : boolean {
        return IMPLICIT_MULTIPLICATION_TOKENS.has( token.type );
    }

  private match(...types: TokenType[]): boolean {
    for (const t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.prev();
  }

  private prev(): Token {
    return this.tokens[this.current - 1];
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private consume(type: TokenType, msg: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(msg);
  }

  private error(msg: string): Error {
    const t = this.peek();
    return new Error(`${msg} at ${t.position.line}:${t.position.column}`);
  }
}
