/**
 * NodeFormatter provides utilities for formatting and manipulating AST nodes.
 * 
 * It includes logic for retrieving child nodes, generating labels for visualization,
 * and converting AST nodes back into string representations of mathematical formulas.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { ASTNode } from './ast';
import type { ChildrenGetter, FunctionBuilder, Labeler, Stringifier, VisualizationOptions } from './types';
import { OPERATOR_BY_SYMBOL } from './definitions';


/**
 * Helper function to extract a variable name from an identifier or constant node.
 * 
 * @param {ASTNode} node - The AST node to extract the name from.
 * @returns {string} The name of the variable or 'x' as a default.
 */
export function extractVarName ( node: ASTNode ) : string {
    return ( node.kind === 'identifier' || node.kind === 'constant' ) ? node.props.name : 'x';
}

/**
 * Registry of custom builders for specific mathematical functions to handle complex argument structures.
 */
export const FUNCTION_BUILDERS: Record< string, FunctionBuilder > = {
    sqrt: ( create, args, position ) => {
        if ( args.length === 2 ) return create( 'sqrt', { radicand: args[ 1 ], degree: args[ 0 ] }, position );
        return create( 'sqrt', { radicand: args[ 0 ] }, position );
    },
    integral: ( create, args, position ) => {
        const variable = extractVarName( args[ 0 ] );
        if ( args.length === 2 ) return create( 'integral', { variable, expression: args[ 1 ] }, position );
        return create( 'integral', { variable, lower: args[ 0 ], upper: args[ 2 ], expression: args[ 3 ] }, position );
    },
    sum: ( create, args, position ) => create( 'summation', {
        variable: extractVarName( args[ 0 ] ), lower: args[ 1 ], upper: args[ 2 ], expression: args[ 3 ]
    }, position ),
    product: ( create, args, position ) => create( 'product', {
        variable: extractVarName( args[ 0 ] ), lower: args[ 1 ], upper: args[ 2 ], expression: args[ 3 ]
    }, position ),
    derivative: ( create, args, position ) => create( 'derivative', { variable: extractVarName( args[ 1 ] ), expression: args[ 0 ] }, position ),
    partial: ( create, args, position ) => create( 'partial', { variable: extractVarName( args[ 1 ] ), expression: args[ 0 ] }, position )
};


/**
 * The NodeFormatter class centralizes the logic for AST node traversal, labeling, and string conversion.
 */
export class NodeFormatter {

    /** Strategy map for extracting children from different types of nodes. */
    private static readonly CHILDREN: Record< string, ChildrenGetter > = {
        binary: ( n ) => [ n.props.left, n.props.right ],
        unary: ( n ) => [ n.props.operand ],
        function: ( n ) => n.props.args ?? [],
        group: ( n ) => [ n.props.expression ],
        power: ( n ) => [ n.props.base, n.props.exponent ],
        sqrt: ( n ) => (n.props.degree ? [ n.props.radicand, n.props.degree ] : [ n.props.radicand ]),
        summation: ( n ) => [ n.props.lower, n.props.upper, n.props.expression ],
        product: ( n ) => [ n.props.lower, n.props.upper, n.props.expression ],
        integral: ( n ) => [ n.props.lower, n.props.upper, n.props.expression ].filter( Boolean ) as ASTNode[],
        derivative: ( n ) => [ n.props.expression ],
        partial: ( n ) => [ n.props.expression ],
        vector: ( n ) => n.props.elements ?? [],
        matrix: ( n ) => ( n.props.rows ?? [] ).flat(),
        complex: ( n ) => [ n.props.real, n.props.imaginary ],
        range: ( n ) => [ n.props.lower, n.props.upper ],
        index: ( n ) => [ n.props.base, n.props.index ],
        subscript: ( n ) => [ n.props.base, n.props.subscript ],
        ellipsis: ( n ) => [ n.props.left, n.props.right ],
        factorial: ( n ) => [ n.props.operand ]
    };

    /** Strategy map for generating localized labels for AST nodes. */
    private static readonly LABELS: Record< string, Labeler > = {
        number: ( n ) => `number: ${n.props.value}`,
        identifier: ( n ) => `variable: ${n.props.name}`,
        constant: ( n ) => `const: ${n.props.name} = ${n.props.value}`,
        binary: ( n ) => `binary: ${ OPERATOR_BY_SYMBOL.get( n.props.operator )?.label ?? n.props.operator }`,
        unary: ( n ) => `unary: ${ OPERATOR_BY_SYMBOL.get( n.props.operator )?.label ?? n.props.operator }`,
        function: ( n ) => `func: ${n.props.name}(${ ( n.props.args ?? [] ).length })`, 
        group: () => 'group',
        sqrt: ( n ) => n.props.degree ? `root: ${ NodeFormatter.toString( n.props.degree ) }-th` : 'sqrt',
        power: () => 'power',
        summation: ( n ) => `sum: Σ(i=${ NodeFormatter.toString( n.props.lower ) }..${ NodeFormatter.toString( n.props.upper ) })`,
        product: ( n ) => `product: Π(i=${ NodeFormatter.toString( n.props.lower ) }..${ NodeFormatter.toString( n.props.upper ) })`,
        integral: ( n ) => n.props.lower && n.props.upper
            ? `integral: ∫[${ NodeFormatter.toString( n.props.lower ) }, ${ NodeFormatter.toString( n.props.upper ) }] d${n.props.variable}`
            : `integral: ∫ d${n.props.variable}`,
        derivative: ( n ) => `derivative: d/d${n.props.variable}`,
        partial: ( n ) => `partial: ∂/∂${n.props.variable}`,
        vector: ( n ) => `vector[${ ( n.props.elements ?? [] ).length }]`,
        matrix: ( n ) => `matrix[${ ( n.props.rows ?? [] ).length }x${ ( n.props.rows?.[ 0 ]?.length ?? 0 ) }]`,
        complex: () => 'complex',
        range: ( n ) => {
            const li = n.props.lowerInclusive ? '[' : '(';
            const ui = n.props.upperInclusive ? ']' : ')';
            const lower = NodeFormatter.toString( n.props.lower );
            const upper = NodeFormatter.toString( n.props.upper );
            return `range: ${li}${lower}..${upper}${ui}`;
        },
        index: ( n ) => `index: [${ NodeFormatter.toString( n.props.index ) }]`,
        ellipsis: () => 'ellipsis',
        factorial: () => 'factorial'
    };

    /** Strategy map for converting AST nodes to mathematical formula strings. */
    private static readonly STRINGIFIERS: Record< string, Stringifier > = {
        number: ( n ) => String( n.props.value ),
        identifier: ( n ) => n.props.name,
        constant: ( n ) => n.props.name,
        binary: ( n, parentPrecedence ) => {
            const op = n.props.operator;
            const prec = this.getOperatorPrecedence( op );
            const left = this.toString( n.props.left, prec );
            const right = this.toString( n.props.right, prec + ( this.isRightAssociative( op ) ? 0 : 1 ) );
            return prec < parentPrecedence ? `(${left} ${op} ${right})` : `${left} ${op} ${right}`;
        },
        unary: ( n ) => `${n.props.operator}${ this.toString( n.props.operand, 15 ) }`,
        function: ( n ) => `${n.props.name}(${ ( n.props.args ?? [] ).map( ( a: ASTNode ) => NodeFormatter.toString( a ) ).join( ', ' ) })`,
        group: ( n ) => `(${ NodeFormatter.toString( n.props.expression ) })`,
        power: ( n ) => `${ NodeFormatter.toString( n.props.base, 13 ) }^${ NodeFormatter.toString( n.props.exponent, 12 ) }`,
        sqrt: ( n ) => {
            const degree = n.props.degree ? `[${ NodeFormatter.toString( n.props.degree ) }]` : '';
            return `sqrt${degree}(${ NodeFormatter.toString( n.props.radicand ) })`;
        },
        summation: ( n ) => {
            const lower = NodeFormatter.toString( n.props.lower );
            const upper = NodeFormatter.toString( n.props.upper );
            const expr = NodeFormatter.toString( n.props.expression );
            return `sum(${n.props.variable}, ${lower}, ${upper}, ${expr})`;
        },
        product: ( n ) => {
            const lower = NodeFormatter.toString( n.props.lower );
            const upper = NodeFormatter.toString( n.props.upper );
            const expr = NodeFormatter.toString( n.props.expression );
            return `product(${n.props.variable}, ${lower}, ${upper}, ${expr})`;
        },
        integral: ( n ) => {
            const bounds = n.props.lower && n.props.upper
                ? `[${ NodeFormatter.toString( n.props.lower ) }, ${ NodeFormatter.toString( n.props.upper ) }]`
                : '';
            return `integral${bounds}(${ NodeFormatter.toString( n.props.expression ) }, d${n.props.variable})`;
        },
        derivative: ( n ) => `d/d${n.props.variable}(${ NodeFormatter.toString( n.props.expression ) })`,
        partial: ( n ) => `∂/∂${n.props.variable}(${ NodeFormatter.toString( n.props.expression ) })`,
        vector: ( n ) => `[${ ( n.props.elements ?? [] ).map( ( e: ASTNode ) => NodeFormatter.toString( e ) ).join( ', ' ) }]`,
        matrix: ( n ) => `[${ ( n.props.rows ?? [] ).map( ( r: ASTNode[] ) => `[${
            r.map( ( e ) => NodeFormatter.toString( e ) ).join( ', ' )
        }]` ).join( ', ' ) }]`,
        complex: ( n ) => `(${ NodeFormatter.toString( n.props.real ) } + ${ NodeFormatter.toString( n.props.imaginary ) }i)`,
        range: ( n ) => {
            const li = n.props.lowerInclusive ? '[' : '(';
            const ui = n.props.upperInclusive ? ']' : ')';
            const lower = NodeFormatter.toString( n.props.lower );
            const upper = NodeFormatter.toString( n.props.upper );
            return `${li}${lower}, ${upper}${ui}`;
        },
        index: ( n ) => `${ NodeFormatter.toString( n.props.base ) }[${ NodeFormatter.toString( n.props.index ) }]`,
        subscript: ( n ) => `${ NodeFormatter.toString( n.props.base ) }_${ NodeFormatter.toString( n.props.subscript ) }`,
        ellipsis: ( n ) => `${ NodeFormatter.toString( n.props.left ) } ... ${ NodeFormatter.toString( n.props.right ) }`,
        factorial: ( n ) => `${ NodeFormatter.toString( n.props.operand ) }!`
    };


    /**
     * Retrieves the precedence level for a given operator symbol.
     * 
     * @param {string} op - The operator symbol.
     * @returns {number} The precedence level (higher means higher precedence).
     */
    public static getOperatorPrecedence ( op: string ) : number {
        return OPERATOR_BY_SYMBOL.get( op )?.precedence ?? 0;
    }

    /**
     * Checks if a given operator is right-associative.
     * 
     * @param {string} op - The operator symbol.
     * @returns {boolean} True if the operator is right-associative, false otherwise.
     */
    public static isRightAssociative ( op: string ) : boolean {
        return OPERATOR_BY_SYMBOL.get( op )?.associativity === 'right';
    }

    /**
     * Returns the child nodes of a given AST node.
     * 
     * @param {ASTNode} node - The parent AST node.
     * @returns {ASTNode[]} An array of child nodes.
     */
    public static getChildren ( node: ASTNode ) : ASTNode[] {
        return this.CHILDREN[ node.kind ]?.( node ) ?? [];
    }

    /**
     * Generates a human-readable label for an AST node, used for visualizations.
     * 
     * @param {ASTNode} node - The AST node to label.
     * @param {VisualizationOptions} [options={}] - Formatting options.
     * @returns {string} The generated label.
     */
    public static getLabel ( node: ASTNode, options: VisualizationOptions = {} ) : string {
        let label = this.LABELS[ node.kind ]?.( node, options ) ?? node.kind;

        if ( options.showTypes ) label = `[${node.kind}] ${label}`;
        if ( options.showPositions && node.position ) label += ` @${node.position.line}:${node.position.column}`;

        return label;
    }

    /**
     * Converts an AST node and its sub-tree to a formatted mathematical formula string.
     * 
     * @param {ASTNode} node - The root node of the sub-tree to convert.
     * @param {number} [parentPrecedence=0] - The precedence level of the parent node (used for parenting).
     * @returns {string} The resulting formula string.
     */
    public static toString ( node: ASTNode, parentPrecedence = 0 ) : string {
        return this.STRINGIFIERS[ node.kind ]?.( node, parentPrecedence ) ?? '';
    }

}
