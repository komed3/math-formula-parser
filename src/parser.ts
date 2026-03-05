import type { ASTNode, Token } from './types';
import * as AST from './ast';
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
