/**
 * Formula is the main entry point of the library, providing methods for
 * parsing, analysis, and visualization of mathematical formulas.
 * 
 * It manages the original formula string and the generated Abstract Syntax Tree (AST),
 * offering simplified access to parsing and high-level analysis tasks.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { ASTNode } from './ast';
import type { AnalysisResult, InstructionSet, VisualizationOptions } from './types';
import { CONSTANTS, FUNCTIONS, OPERATORS } from './definitions';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Visualizer } from './visualizer';


/**
 * The Formula class provides a high-level API for working with mathematical formulas.
 * It handles the process of tokenizing, parsing, and analyzing formulas.
 */
export class Formula {

    /** The original formula string that was parsed. */
    private _formula?: string;

    /** The root node of the generated Abstract Syntax Tree (AST). */
    private _ast?: ASTNode;

    /**
     * Creates a new instance of Formula, optionally parsing a formula string.
     * 
     * @param {string} [formula] - The mathematical formula string to parse.
     */
    constructor ( formula?: string ) {
        if ( formula ) this.parse( formula );
    }

    /**
     * Traversing the AST and collecting values based on a mapper function.
     * 
     * @param {ASTNode} ast - The root node of the AST to traverse.
     * @param {( node: ASTNode ) => string | undefined} mapper - A function that returns a value to collect for each node.
     * @returns {Set< string >} A set of unique collected values.
     */
    private collect ( ast: ASTNode, mapper: ( node: ASTNode ) => string | undefined ) : Set< string > {
        const result = new Set< string >();
        this.visit( ast, ( node ) => {
            const value = mapper( node );
            if ( value ) result.add( value );
        } );

        return result;
    }

    /**
     * Recursively traverses the AST and applies a function to each node.
     * 
     * @param {ASTNode} ast - The root node of the AST to visit.
     * @param {( node: ASTNode, depth: number ) => void} fn - The function to apply to each node.
     * @param {number} [depth=1] - The current depth of the traversal.
     */
    private visit ( ast: ASTNode, fn: ( node: ASTNode, depth: number ) => void, depth = 1 ) : void {
        fn( ast, depth );
        for ( const child of ast.children() ) this.visit( child, fn, depth + 1 );
    }


    /**
     * Parses a mathematical formula string into an AST.
     * 
     * @param {string} formula - The mathematical formula string to parse.
     * @returns {ASTNode} The root node of the generated AST.
     */
    public parse ( formula: string ) : ASTNode {
        this._formula = formula;
        this._ast = new Parser( new Lexer( formula ).tokenize() ).parse();
        return this._ast;
    }

    /**
     * Returns the root node of the AST for the parsed formula.
     * 
     * @returns {ASTNode} The root node of the AST.
     * @throws {Error} If no formula has been parsed yet.
     */
    public get ast(): ASTNode {
        if ( ! this._ast ) throw new Error( 'No formula has been parsed yet.' );
        return this._ast;
    }

    /**
     * Returns the original mathematical formula string.
     * 
     * @returns {string} The formula string.
     * @throws {Error} If no formula has been parsed yet.
     */
    public get formula () : string {
        if ( ! this._formula ) throw new Error( 'No formula has been parsed yet.' );
        return this._formula;
    }

    /**
     * Returns a string representation of the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to represent as a string (defaults to the full formula).
     * @returns {string} The string representation of the AST.
     */
    public toString ( ast?: ASTNode ) : string {
        return ( ast ?? this.ast ).toString();
    }

    /**
     * Returns a visual string representation of the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to visualize.
     * @param {VisualizationOptions} [options] - Optional settings for the visualization.
     * @returns {string} The visual representation of the AST.
     */
    public visualize ( ast?: ASTNode, options?: VisualizationOptions ) : string {
        return new Visualizer().visualize( ast ?? this.ast, options );
    }

    /**
     * Returns a compact visual string representation of the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to visualize.
     * @returns {string} The compact visual representation of the AST.
     */
    public visualizeCompact ( ast?: ASTNode ) : string {
        return new Visualizer().visualize( ast ?? this.ast, { compact: true } );
    }

    /**
     * Returns a JSON representation of the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to represent as JSON.
     * @param {number} [indent=2] - The number of spaces to use for indentation.
     * @returns {string} The JSON string representation of the AST.
     */
    public visualizeJSON ( ast?: ASTNode, indent = 2 ) : string {
        return JSON.stringify( ast ?? this.ast, null, indent );
    }

    /**
     * Extracts all unique variable names from the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to analyze.
     * @returns {Set< string >} A set containing the names of all variables found.
     */
    public getVariables ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'identifier' ? n.props.name : undefined );
    }

    /**
     * Extracts all unique constant names from the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to analyze.
     * @returns {Set< string >} A set containing the names of all constants found.
     */
    public getConstants ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'constant' ? n.props.name : undefined );
    }

    /**
     * Extracts all unique function names from the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to analyze.
     * @returns {Set< string >} A set containing the names of all functions found.
     */
    public getFunctions ( ast?: ASTNode ) : Set< string > {
        return this.collect( ast ?? this.ast, n => n.kind === 'function' ? n.props.name : undefined );
    }

    /**
     * Calculates the maximum depth of the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to analyze.
     * @returns {number} The maximum depth of the AST.
     */
    public getDepth ( ast?: ASTNode ) : number {
        const root = ast ?? this.ast;
        let maxDepth = 0;

        this.visit( root, ( _, depth ) => { if ( depth > maxDepth ) maxDepth = depth } );
        return maxDepth;
    }

    /**
     * Counts the total number of nodes in the formula's AST.
     * 
     * @param {ASTNode} [ast] - An optional AST node to analyze.
     * @returns {number} The total number of nodes.
     */
    public getNodeCount ( ast?: ASTNode ) : number {
        let count = 0;
        this.visit( ast ?? this.ast, () => count++ );
        return count;
    }

    /**
     * Parses a formula and performs a complete analysis, returning all results in a single object.
     * 
     * @param {string} formula - The mathematical formula string to analyze.
     * @returns {AnalysisResult} An object containing the AST and various analysis results.
     */
    public parseAndAnalyze ( formula: string ) : AnalysisResult {
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


    /**
     * Returns an overview of the supported instruction set including versions and operators.
     * 
     * @returns {InstructionSet} An object containing version, constants, functions, and operators.
     */
    public static instructionSet () : InstructionSet {
        return {
          version: '0.1.0',
          constants: Object.keys( CONSTANTS ),
          functions: Array.from( FUNCTIONS ).sort(),
          operators: OPERATORS.map( ( op ) => op.symbol )
        };
    }

    /**
     * Returns a list of all available mathematical constants.
     * 
     * @returns {Record< string, number >} A record of available constants and their values.
     */
    public static availableConstants () : Record< string, number > {
        return { ...CONSTANTS };
    }

    /**
     * Returns a list of all supported mathematical function names.
     * 
     * @returns {string[]} An array of supported function names.
     */
    public static availableFunctions () : string[]{
        return Array.from( FUNCTIONS ).sort();
    }

}
