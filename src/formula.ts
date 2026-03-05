import type { ASTNode } from './types';
import * as AST from './ast';
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

    private children ( node: ASTNode ) : ASTNode[] {
        if ( node instanceof AST.BinaryOpNode ) return [ node.left, node.right ];
        if ( node instanceof AST.UnaryOpNode ) return [ node.operand ];
        if ( node instanceof AST.FunctionNode ) return node.args;
        if ( node instanceof AST.GroupNode ) return [ node.expression ];
        if ( node instanceof AST.SqrtNode ) return node.degree ? [ node.radicand, node.degree ] : [ node.radicand ];
        if ( node instanceof AST.PowerNode ) return [ node.base, node.exponent ];
        if ( node instanceof AST.SummationNode ) return [ node.lower, node.upper, node.expression ];
        if ( node instanceof AST.ProductNode ) return [ node.lower, node.upper, node.expression ];
        if ( node instanceof AST.DerivativeNode || node instanceof AST.PartialDerivativeNode ) return [ node.expression ];
        if ( node instanceof AST.VectorNode ) return node.elements;
        if ( node instanceof AST.MatrixNode ) return node.rows.flat();
        if ( node instanceof AST.ComplexNode ) return [ node.real, node.imaginary ];
        if ( node instanceof AST.IndexNode ) return [ node.base, node.index ];
        if ( node instanceof AST.SubscriptNode ) return [ node.base, node.subscript ];
        if ( node instanceof AST.RangeNode ) return [ node.lower, node.upper ];
        if ( node instanceof AST.EllipsisNode ) return [ node.left, node.right ];
        if ( node instanceof AST.FactorialNode ) return [ node.operand ];
        if ( node instanceof AST.IntegralNode ) {
            const children: ASTNode[] = [];
            if ( node.lower ) children.push( node.lower );
            if ( node.upper ) children.push( node.upper );
            children.push( node.expression );
            return children;
        }

        return [];
    }

    private isLeaf ( node: ASTNode ) : boolean {
        return node instanceof AST.NumberNode || node instanceof AST.VariableNode || node instanceof AST.ConstantNode;
    }

    private traverse ( node: ASTNode, fn: ( n: ASTNode ) => void ) {
        fn( node );
        for ( const child of this.children( node ) ) this.traverse( child, fn );
    }

}
