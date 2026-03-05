import type { ASTNode } from './types';
import { MATH_CONSTANTS, MATH_FUNCTIONS } from './constants';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Visualizer } from './visualizer';

export class MathFormulaParser {

    private static readonly visualizer = new Visualizer();

    public static instructionSet () {
        return {
            version: '0.1.0-alpha',
            constants: Object.keys( MATH_CONSTANTS ),
            functions: Array.from( MATH_FUNCTIONS ).sort(),
            operators: [ '+', '-', '*', '/', '^', '%', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '...' ],
            specialOps: [ 'integral', 'sum', 'product', 'sqrt', 'd/dx', 'partial' ]
        };
    }

    public parse ( formula: string ) : ASTNode {
        const parser = new Parser( ( new Lexer( formula ) ).tokenize() );
        return parser.parse();
    }

}
