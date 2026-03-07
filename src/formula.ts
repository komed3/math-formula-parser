import type { ASTNode } from './ast';
import type { VisualizationOptions } from './types';
import { CONSTANTS, FUNCTIONS, OPERATORS } from './definitions';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Visualizer } from './visualizer';


export class Formula {

    private _formula?: string;
    private _ast?: ASTNode;

    constructor ( formula?: string ) {
        if ( formula ) this.parse( formula );
    }

    private collect ( ast: ASTNode, mapper: ( node: ASTNode ) => string | undefined ) : Set< string > {
        const result = new Set< string >();
        this.visit( ast, ( node ) => {
            const value = mapper( node );
            if ( value ) result.add( value );
        } );

        return result;
    }

    private visit ( ast: ASTNode, fn: ( node: ASTNode, depth: number ) => void, depth = 1 ) : void {
        fn( ast, depth );
        for ( const child of ast.children() ) this.visit( child, fn, depth + 1 );
    }


    public parse ( formula: string ) : ASTNode {
        this._formula = formula;
        this._ast = new Parser( new Lexer( formula ).tokenize() ).parse();
        return this._ast;
    }

    public get ast(): ASTNode {
        if ( ! this._ast ) throw new Error( 'No formula has been parsed yet.' );
        return this._ast;
    }

    public get formula () : string {
        if ( ! this._formula ) throw new Error( 'No formula has been parsed yet.' );
        return this._formula;
    }

    public toString ( ast?: ASTNode ) : string {
        return ( ast ?? this.ast ).toString();
    }

    public visualize ( ast?: ASTNode, options?: VisualizationOptions ) : string {
        return new Visualizer().visualize( ast ?? this.ast, options );
    }

    public visualizeCompact ( ast?: ASTNode ) : string {
        return new Visualizer().visualize( ast ?? this.ast, { compact: true } );
    }

    public visualizeJSON ( ast?: ASTNode, indent = 2 ) : string {
        return JSON.stringify( ast ?? this.ast, null, indent );
    }

    public getVariables ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'identifier' ? n.props.name : undefined );
    }

    public getConstants ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'constant' ? n.props.name : undefined );
    }

    public getFunctions ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'function' ? n.props.name : undefined );
    }

    public getDepth ( ast?: ASTNode ) : number {
        const root = ast ?? this.ast;
        let maxDepth = 0;

        this.visit( root, ( _, depth ) => { if ( depth > maxDepth ) maxDepth = depth } );
        return maxDepth;
    }

    public getNodeCount ( ast?: ASTNode ) : number {
        let count = 0;
        this.visit( ast ?? this.ast, () => count++ );
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


    public static instructionSet () {
        return {
          version: '0.1.0',
          constants: Object.keys( CONSTANTS ),
          functions: Array.from( FUNCTIONS ).sort(),
          operators: OPERATORS.map( ( op ) => op.symbol )
        };
    }

    public static availableConstants () {
        return { ...CONSTANTS };
    }

    public static availableFunctions () {
        return Array.from( FUNCTIONS ).sort();
    }

}
