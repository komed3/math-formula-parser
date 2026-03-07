import type { ASTNode } from './ast';
import type { VisualizationOptions } from './types';


export class Visualizer {

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

}
