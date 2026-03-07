import type { Position, VisualizationOptions } from './types';
import { NodeFormatter } from './formatter';

export class ASTNode {

    public readonly kind: string;
    public readonly props: Record< string, any >;
    public readonly position?: Position;

    constructor ( kind: string, props: Record< string, any > = {}, position?: Position ) {
        this.kind = kind;
        this.props = props;
        this.position = position;
    }

    public children () : ASTNode[] {
        return NodeFormatter.getChildren( this );
    }

    public label ( options: VisualizationOptions = {} ) : string {
        return NodeFormatter.getLabel( this, options );
    }

    public toString ( parentPrecedence = 0 ) : string {
        return NodeFormatter.toString( this, parentPrecedence );
    }

    public walk ( fn: ( node: ASTNode, depth: number ) => void, depth = 1 ) : void {
        fn( this, depth );
        for ( const child of this.children() ) child.walk( fn, depth + 1 );
    }

}
