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

}
