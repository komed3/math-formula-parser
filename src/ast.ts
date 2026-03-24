/**
 * ASTNode represents a single node in the Abstract Syntax Tree (AST).
 * 
 * Each node has a kind, properties, and an optional position in the source formula.
 * The AST is built by the Parser and used for analysis and visualization.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { Position, VisualizationOptions } from './types';
import { NodeFormatter } from './formatter';


/**
 * Represents a node within the Abstract Syntax Tree (AST) of a mathematical formula.
 */
export class ASTNode {

    /** The type or kind of the AST node (e.g., 'binary_op', 'function', 'literal'). */
    public readonly kind: string;

    /** Additional properties specific to the node's kind (e.g., operator symbol, function name). */
    public readonly props: Record< string, any >;

    /** The position of the node within the original formula string (if available). */
    public readonly position?: Position;

    /**
     * Creates a new ASTNode instance.
     * 
     * @param {string} kind - The type of the node.
     * @param {Record< string, any >} [props={}] - Kind-specific properties.
     * @param {Position} [position] - The node's position in the source string.
     */
    constructor ( kind: string, props: Record< string, any > = {}, position?: Position ) {
        this.kind = kind;
        this.props = props;
        this.position = position;
    }

    /**
     * Returns an array of children for the current AST node.
     * 
     * @returns {ASTNode[]} An array of child ASTNode instances.
     */
    public children () : ASTNode[] {
        return NodeFormatter.getChildren( this );
    }

    /**
     * Returns a human-readable label for the current AST node.
     * 
     * @param {VisualizationOptions} [options={}] - Options for label formatting.
     * @returns {string} The node's label.
     */
    public label ( options: VisualizationOptions = {} ) : string {
        return NodeFormatter.getLabel( this, options );
    }

    /**
     * Converts the AST node (and its sub-tree) back into a mathematical formula string.
     * 
     * @param {number} [parentPrecedence=0] - The precedence level of the parent node to determine parentheses.
     * @returns {string} The string representation of the node.
     */
    public toString ( parentPrecedence = 0 ) : string {
        return NodeFormatter.toString( this, parentPrecedence );
    }

    /**
     * Recursively traverses the sub-tree rooted at this node.
     * 
     * @param {( node: ASTNode, depth: number ) => void} fn - The function to apply to each node during traversal.
     * @param {number} [depth=1] - The starting depth for the traversal.
     */
    public walk ( fn: ( node: ASTNode, depth: number ) => void, depth = 1 ) : void {
        fn( this, depth );
        for ( const child of this.children() ) child.walk( fn, depth + 1 );
    }

}
