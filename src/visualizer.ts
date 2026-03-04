import type { ASTNode, VisualizationOptions } from './types';
import * as AST from './ast';

export class Visualizer {

    private static readonly BINARY_OPS: Record< string, string > = {
        '+': 'addition', '-': 'substraction', '*': 'multiplication', '/': 'division',
        '^': 'power', '%': 'modulo', '==': 'equal', '!=': 'not equal', '<': 'lower than',
        '>': 'greater than', '<=': 'lower than equal', '>=': 'greater than equal',
        '&&': 'and', '||': 'or', '=': 'assign'
    };

    private static readonly UNARY_OPS: Record< string, string > = {
        '+': 'positiv', '-': 'negative', '!': 'not'
    };

    public visualize ( node: ASTNode, options: VisualizationOptions = {} ) : string {
        if ( options.compact ) return this.get( node );

        const lines: string[] = [];
        const children = this.children( node );
        lines.push( this.label( node, options ) );

        for ( let i = 0; i < children.length; i++ ) {
            this.tree( children[ i ], '', i === children.length - 1, lines, options );
        }

        return lines.join( '\n' );
    }

    private tree (
        node: ASTNode, prefix: string, isLast: boolean, lines: string[],
        options: VisualizationOptions
    ) : void {
        const label = this.label( node, options );
        const connector = isLast ? '└─ ' : '├─ ';
        const currentLine = prefix + connector + label;
        lines.push( currentLine );

        const children = this.children( node );
        const nextPrefix = prefix + ( isLast ? '   ' : '│  ' );

        for ( let i = 0; i < children.length; i++ ) {
            this.tree( children[ i ], nextPrefix, i === children.length - 1, lines, options );
        }
    }

    private label ( node: ASTNode, options: VisualizationOptions ) : string {
        let label = '';

        if ( node instanceof AST.NumberNode ) {
            label = `number: ${node.value}`;
        } else if ( node instanceof AST.VariableNode ) {
            label = `variable: ${node.name}`;
        } else if ( node instanceof AST.ConstantNode ) {
            label = `const: ${node.name} = ${node.value}`;
        } else if ( node instanceof AST.BinaryOpNode ) {
            label = `binary: ${ Visualizer.BINARY_OPS[ node.operator ] || node.operator }`;
        } else if ( node instanceof AST.UnaryOpNode ) {
            label = `unary: ${ Visualizer.UNARY_OPS[ node.operator ] || node.operator }`;
        } else if ( node instanceof AST.FunctionNode ) {
            label = `func: ${node.name}(${node.args.length})`;
        } else if ( node instanceof AST.GroupNode ) {
            label = `group`;
        } else if ( node instanceof AST.SqrtNode ) {
            label = node.degree ? `root: ${ this.get( node.degree ) }-th` : `sqrt`;
        } else if ( node instanceof AST.PowerNode ) {
            label = `power`;
        } else if ( node instanceof AST.SummationNode ) {
            label = `sum: Σ(i=${ this.get( node.lower ) }..${ this.get( node.upper ) })`;
        } else if ( node instanceof AST.ProductNode ) {
            label = `product: Π(i=${ this.get( node.lower ) }..${ this.get( node.upper ) })`;
        } else if ( node instanceof AST.IntegralNode ) {
            label = node.lower && node.upper
                ? `integral: ∫[${ this.get( node.lower ) }, ${ this.get( node.upper ) }] d${node.variable}`
                : `integral: ∫ d${node.variable}`;
        } else if ( node instanceof AST.DerivativeNode ) {
            label = `derivative: d/d${node.variable}`;
        } else if ( node instanceof AST.PartialDerivativeNode ) {
            label = `partial: ∂/∂${node.variable}`;
        } else if ( node instanceof AST.VectorNode ) {
            label = `vector[${node.elements.length}]`;
        } else if ( node instanceof AST.MatrixNode ) {
            label = `matrix[${node.rows.length}x${ node.rows[ 0 ]?.length || 0 }]`;
        } else if ( node instanceof AST.ComplexNode ) {
            label = `complex`;
        } else if ( node instanceof AST.RangeNode ) {
            const li = node.lowerInclusive ? '[' : '(';
            const ui = node.upperInclusive ? ']' : ')';
            label = `range: ${li}${ this.get( node.lower ) }..${ this.get( node.upper ) }${ui}`;
        } else if ( node instanceof AST.IndexNode ) {
            label = `index: [${ this.get( node.index ) }]`;
        } else if ( node instanceof AST.EllipsisNode ) {
            label = `ellipsis`;
        } else {
            label = `${node.type}`;
        }

        if ( options.showTypes ) label = `[${node.type}] ${label}`;
        if ( options.showPositions && node.position ) label += ` @${node.position.line}:${node.position.column}`;

        return label;
    }

    private get ( node: ASTNode ) : string {
        if ( node instanceof AST.NumberNode ) {
            return node.value.toString();
        } else if ( node instanceof AST.VariableNode || node instanceof AST.ConstantNode ) {
            return node.name;
        } else if ( node instanceof AST.BinaryOpNode ) {
            return `${ this.get( node.left ) } ${node.operator} ${ this.get( node.right ) }`;
        } else if ( node instanceof AST.UnaryOpNode ) {
            return `${node.operator}${ this.get( node.operand ) }`;
        } else if ( node instanceof AST.FunctionNode ) {
            return `${node.name}( ${ node.args.map( a => this.get( a ) ).join( ', ' ) })`;
        } else if ( node instanceof AST.GroupNode ) {
            return `(${ this.get( node.expression ) })`;
        } else if ( node instanceof AST.SqrtNode ) {
            const rad = this.get( node.radicand );
            return `sqrt${ node.degree ? `[${ this.get( node.degree ) }]` : '' }(${rad})`;
        } else if ( node instanceof AST.PowerNode ) {
            return `${ this.get( node.base ) }^${ this.get( node.exponent ) }`;
        } else if ( node instanceof AST.SummationNode ) {
            const lower = this.get( node.lower );
            const upper = this.get( node.upper );
            const expr = this.get( node.expression );
            return `sum(${node.variable}, ${lower}, ${upper}, ${expr})`;
        } else if ( node instanceof AST.ProductNode ) {
            const lower = this.get( node.lower );
            const upper = this.get( node.upper );
            const expr = this.get( node.expression );
            return `product(${node.variable}, ${lower}, ${upper}, ${expr})`;
        } else if ( node instanceof AST.IntegralNode ) {
            const bounds = node.lower && node.upper ? `[${ this.get( node.lower ) }, ${ this.get( node.upper ) }]` : '';
            return `integral${bounds}(${ this.get( node.expression ) }, d${node.variable})`;
        } else if ( node instanceof AST.DerivativeNode ) {
            return `d/d${node.variable}(${ this.get( node.expression ) })`;
        } else if ( node instanceof AST.PartialDerivativeNode ) {
            return `∂/∂${node.variable}(${ this.get( node.expression ) })`;
        } else if ( node instanceof AST.VectorNode ) {
            return `[${ node.elements.map( e => this.get( e ) ).join( ', ' ) }]`;
        } else if ( node instanceof AST.MatrixNode ) {
            const rows = node.rows.map( r => `[${ r.map( e => this.get( e ) ).join( ', ' ) }]` ).join( ', ' );
            return `[${rows}]`;
        } else if ( node instanceof AST.ComplexNode ) {
            return `(${ this.get( node.real ) } + ${ this.get( node.imaginary ) }i)`;
        } else if ( node instanceof AST.IndexNode ) {
            return `${ this.get( node.base ) }[${ this.get( node.index ) }]`;
        } else if ( node instanceof AST.SubscriptNode ) {
            return `${ this.get( node.base ) }_${ this.get( node.subscript ) }`;
        } else if ( node instanceof AST.RangeNode ) {
            const li = node.lowerInclusive ? '[' : '(';
            const ui = node.upperInclusive ? ']' : ')';
            return `${li}${ this.get( node.lower ) },${ this.get( node.upper ) }${ui}`;
        } else if ( node instanceof AST.EllipsisNode ) {
            return `${ this.get( node.left ) }...${ this.get( node.right ) }`;
        } else if ( node instanceof AST.FactorialNode ) {
            return `${ this.get( node.operand ) }!`;
        } else {
            return '<?>';
        }
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
        if ( node instanceof AST.RangeNode ) return [ node.lower, node.upper ];
        if ( node instanceof AST.EllipsisNode ) return [ node.left, node.right ];
        if ( node instanceof AST.IntegralNode ) {
            const children: ASTNode[] = [];
            if ( node.lower) children.push( node.lower );
            if ( node.upper) children.push( node.upper );
            children.push( node.expression );
            return children;
        }

        return [];
    }

}
