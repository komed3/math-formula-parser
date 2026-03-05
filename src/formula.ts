import type { ASTNode } from './types';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Visualizer } from './visualizer';

export class MathFormulaParser {

    private static readonly visualizer = new Visualizer();

    public parse ( formula: string ) : ASTNode {
        const parser = new Parser( ( new Lexer( formula ) ).tokenize() );
        return parser.parse();
    }

}
