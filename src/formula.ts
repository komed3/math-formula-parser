import type { ASTNode, VisualizationOptions } from './types';
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

    public static availableConstants () {
        return { ...MATH_CONSTANTS };
    }

    public static getAvailableFunctions () {
        return Array.from( MATH_FUNCTIONS ).sort();
    }

    public parse ( formula: string ) : ASTNode {
        const parser = new Parser( ( new Lexer( formula ) ).tokenize() );
        return parser.parse();
    }

    public toString ( ast: ASTNode ) : string {
        return this.toStringWithPrecedence( ast, -1 );
    }

    public visualize ( ast: ASTNode, options?: VisualizationOptions ) : string {
        return MathFormulaParser.visualizer.visualize( ast, options );
    }

    public visualizeCompact ( ast: ASTNode ) : string {
        return MathFormulaParser.visualizer.visualize( ast, { compact: true } );
    }

    public visualizeJSON ( ast: ASTNode, indent = 2 ) : string {
        return JSON.stringify( ast, null, indent );
    }

    public getVariables ( ast: ASTNode ) : Set< string > {
        const vars = new Set< string >();
        this.traverse( ast, ( node: ASTNode ) => {
            if ( node instanceof AST.VariableNode ) vars.add( node.name );
        } );

        return vars;
    }

    public getConstants ( ast: ASTNode ) : Set< string > {
        const consts = new Set< string >();
        this.traverse( ast, ( node: ASTNode ) => {
            if ( node instanceof AST.ConstantNode ) consts.add( node.name );
        } );

        return consts;
    }

    public getFunctions ( ast: ASTNode ) : Set< string > {
        const funcs = new Set< string >();
        this.traverse( ast, ( node: ASTNode ) => {
            if ( node instanceof AST.FunctionNode ) funcs.add( node.name );
        } );

        return funcs;
    }

    public getDepth ( ast: ASTNode ) : number {
        if ( this.isLeaf( ast ) ) return 1;

        const children = this.children( ast );
        return 1 + ( children.length > 0 ? Math.max( ...children.map( c => this.getDepth( c ) ) ) : 0 );
    }

    public getNodeCount ( ast: ASTNode ) : number {
        let count = 1;
        for ( const child of this.children( ast ) ) count += this.getNodeCount( child );

        return count;
    }

    public parseAndAnalyze ( formula: string ) {
        const ast = this.parse( formula );
        return {
            ast,
            variables: this.getVariables( ast ),
            constants: this.getConstants( ast ),
            functions: this.getFunctions( ast ),
            depth: this.getDepth( ast ),
            nodeCount: this.getNodeCount( ast ),
            string: this.toString( ast )
        };
    }

    private toStringWithPrecedence ( ast: ASTNode, parentPrecedence: number ) : string {
        if ( ast instanceof AST.NumberNode ) return ast.value.toString();
        if ( ast instanceof AST.VariableNode || ast instanceof AST.ConstantNode ) return ast.name;
        if ( ast instanceof AST.BinaryOpNode ) {
            const op = ast.operator;
            const prec = this.getPrecedence( op );
            const left = this.toStringWithPrecedence( ast.left, prec );
            const right = this.toStringWithPrecedence( ast.right, prec + ( this.isRightAssociative( op ) ? 0 : 1 ) );
            const result = `${left} ${op} ${right}`;
            return prec < parentPrecedence ? `(${result})` : result;
        }

        if ( ast instanceof AST.UnaryOpNode ) {
            return `${ast.operator}${ this.toStringWithPrecedence( ast.operand, 15 ) }`;
        }

        if ( ast instanceof AST.FunctionNode ) {
            return `${ast.name}(${ ast.args.map( a => this.toString( a ) ).join( ', ' ) })`;
        }

        if ( ast instanceof AST.GroupNode ) {
            return `(${ this.toString( ast.expression ) })`;
        }

        if ( ast instanceof AST.PowerNode ) {
            const base = this.toStringWithPrecedence( ast.base, 13 );
            const exp = this.toStringWithPrecedence( ast.exponent, 12 );
            return `${base}^${exp}`;
        }

        if ( ast instanceof AST.SqrtNode ) {
            const deg = ast.degree ? `[${ this.toString( ast.degree ) }]` : '';
            return `sqrt${deg}(${ this.toString( ast.radicand ) })`;
        }

        if ( ast instanceof AST.SummationNode ) {
            const lower = this.toString( ast.lower );
            const upper = this.toString( ast.upper );
            const expr = this.toString( ast.expression );
            return `sum(${ast.variable}, ${lower}, ${upper}, ${expr})`;
        }

        if ( ast instanceof AST.ProductNode ) {
            const lower = this.toString( ast.lower );
            const upper = this.toString( ast.upper );
            const expr = this.toString( ast.expression );
            return `product(${ast.variable}, ${lower}, ${upper}, ${expr})`;
        }

        if ( ast instanceof AST.IntegralNode ) {
            const bounds = ast.lower && ast.upper ? `[${ this.toString( ast.lower ) }, ${ this.toString( ast.upper ) }]` : '';
            return `integral${bounds}(${ this.toString( ast.expression ) }, d${ast.variable})`;
        }

        if ( ast instanceof AST.DerivativeNode ) {
            return `d/d${ast.variable}(${ this.toString( ast.expression ) })`;
        }

        if ( ast instanceof AST.PartialDerivativeNode ) {
            return `∂/∂${ast.variable}(${ this.toString( ast.expression ) })`;
        }

        if ( ast instanceof AST.VectorNode ) {
            return `[${ ast.elements.map( e => this.toString( e ) ).join( ', ' ) }]`;
        }

        if ( ast instanceof AST.MatrixNode ) {
            const rows = ast.rows.map( r => `[${ r.map( e => this.toString( e ) ).join( ', ' ) }]` ).join( ', ' );
            return `[${rows}]`;
        }

        if ( ast instanceof AST.ComplexNode ) {
            return `(${ this.toString( ast.real ) } + ${ this.toString( ast.imaginary ) }i)`;
        }

        if ( ast instanceof AST.RangeNode ) {
            const leftBracket = ast.lowerInclusive ? '[' : '(';
            const rightBracket = ast.upperInclusive ? ']' : ')';
            return `${leftBracket}${ this.toString( ast.lower ) }, ${ this.toString( ast.upper ) }${rightBracket}`;
        }

        if ( ast instanceof AST.IndexNode ) return `${ this.toString( ast.base ) }[${ this.toString( ast.index ) }]`;
        if ( ast instanceof AST.SubscriptNode ) return `${ this.toString( ast.base ) }_${ this.toString( ast.subscript ) }`;
        if ( ast instanceof AST.EllipsisNode ) return `${ this.toString( ast.left ) } ... ${ this.toString( ast.right ) }`;
        if ( ast instanceof AST.FactorialNode ) return `${ this.toString( ast.operand ) }!`;

        return '';
    }

    private getPrecedence ( op: string ) : number {
        const precedences: Record< string, number > = {
            '=': 1, '==': 2, '!=': 2,
            '<': 3, '>': 3, '<=': 3, '>=': 3,
            '||': 4, '&&': 5,
            '+': 6, '-': 6,
            '*': 7, '/': 7, '%': 7,
            '^': 13,
        };
        return precedences[ op ] ?? 0;
    }

    private isRightAssociative ( op: string ) : boolean {
        return op === '^' || op === '=';
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
