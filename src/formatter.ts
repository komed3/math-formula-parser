import type { ASTNode } from './ast';
import type { ChildrenGetter, FunctionBuilder, Labeler } from './types';
import { OPERATOR_BY_SYMBOL } from './definitions';


export function extractVarName ( node: ASTNode ) : string {
    return ( node.kind === 'identifier' || node.kind === 'constant' ) ? node.props.name : 'x';
}

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


export class NodeFormatter {

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
        range: ( n ) => `range: ${ n.props.lowerInclusive ? '[' : '(' }${
            NodeFormatter.toString( n.props.lower ) }..${ NodeFormatter.toString( n.props.upper )
        }${ n.props.upperInclusive ? ']' : ')' }`,
        index: ( n ) => `index: [${ NodeFormatter.toString( n.props.index ) }]`,
        ellipsis: () => 'ellipsis',
        factorial: () => 'factorial'
    };

}
