/**
 * Visualizer provides tools for generating a tree-like string representation of the AST.
 * 
 * It supports various visualization options, such as showing node types, positions,
 * and creating a compact string representation.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { ASTNode } from './ast';
import type { VisualizationOptions } from './types';


/**
 * The Visualizer class handles the generation of a human-readable tree structure from an AST.
 */
export class Visualizer {

    /**
     * Recursively traverses the AST and builds a tree-like string representation.
     * 
     * @param {ASTNode} node - The current node to visualize.
     * @param {string} prefix - The current line prefix for nesting.
     * @param {boolean} isLast - Whether the current node is the last child of its parent.
     * @param {string[]} lines - The array to collect the generated lines.
     * @param {VisualizationOptions} options - Formatting and visualization options.
     */
    private tree ( node: ASTNode, prefix: string, isLast: boolean, lines: string[], options: VisualizationOptions ) : void {
        const label = node.label( options );
        const connector = isLast ? '└── ' : '├── ';
        const currentLine = prefix + connector + label;
        lines.push( currentLine );

        const children = node.children();
        const nextPrefix = prefix + ( isLast ? '    ' : '│   ' );

        for ( let i = 0; i < children.length; i++ ) this.tree(
            children[ i ], nextPrefix, i === children.length - 1, lines, options
        );
    }


    /**
     * Entry point for visualizing an AST node as a multi-line tree string.
     * 
     * @param {ASTNode} node - The root node to visualize.
     * @param {VisualizationOptions} [options={}] - Optional configuration for the visualization.
     * @returns {string} The formatted tree-like string.
     */
    public visualize ( node: ASTNode, options: VisualizationOptions = {} ) : string {
        if ( options.compact ) return node.toString();

        const lines: string[] = [];
        const children = node.children();
        lines.push( node.label( options ) );

        for ( let i = 0; i < children.length; i++ ) this.tree(
            children[ i ], '', i === children.length - 1, lines, options
        );

        return lines.join( '\n' );
    }

}
