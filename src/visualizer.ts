import type { ASTNode, VisualizationOptions } from './types';
import * as AST from './ast';

export class Visualizer {

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

}
