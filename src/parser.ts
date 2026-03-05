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
            const op = this.prev().value;
            const right = this.logicalAnd();
            expr = new AST.BinaryOpNode( op, expr, right );
        }

        return expr;
    }

    private logicalAnd () : ASTNode {
        let expr = this.equality();

        while ( this.match( TokenType.AND ) ) {
            const op = this.prev().value;
            const right = this.equality();
            expr = new AST.BinaryOpNode( op, expr, right );
        }

        return expr;
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
