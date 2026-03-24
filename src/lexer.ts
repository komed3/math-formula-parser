/**
 * Lexer is responsible for tokenizing a mathematical formula string.
 * 
 * It breaks down the input string into a sequence of tokens (numbers, operators, identifiers, etc.)
 * based on predefined regular expression patterns.
 * 
 * @author Paul Köhler
 * @license MIT
 */

import type { Token, TokenPattern, Position } from './types';
import { TokenType } from './types';


/**
 * The Lexer class performs lexical analysis on a formula string,
 * converting it into a series of tokens that the parser can understand.
 */
export class Lexer {

    /** Predefined regular expressions for all supported token types. */
    private static readonly PATTERN: TokenPattern[] = [
        { regex: /\s+/, type: TokenType.WHITESPACE, skip: true },
        { regex: /\d+\.\d+([eE][+-]?\d+)?/, type: TokenType.NUMBER },
        { regex: /\d+([eE][+-]?\d+)?/, type: TokenType.NUMBER },
        { regex: /==/, type: TokenType.EQUAL },
        { regex: /!=/, type: TokenType.NOT_EQUAL },
        { regex: /<=/, type: TokenType.LESS_EQUAL },
        { regex: />=/, type: TokenType.GREATER_EQUAL },
        { regex: /&&/, type: TokenType.AND },
        { regex: /\|\|/, type: TokenType.OR },
        { regex: /\+/, type: TokenType.PLUS },
        { regex: /\-/, type: TokenType.MINUS },
        { regex: /\*/, type: TokenType.MULTIPLY },
        { regex: /\//, type: TokenType.DIVIDE },
        { regex: /\^/, type: TokenType.POWER },
        { regex: /%/, type: TokenType.MODULO },
        { regex: /</, type: TokenType.LESS_THAN },
        { regex: />/, type: TokenType.GREATER_THAN },
        { regex: /!/, type: TokenType.NOT },
        { regex: /_/, type: TokenType.UNDER },
        { regex: /\.\.\./, type: TokenType.ELLIPSIS },
        { regex: /\(/, type: TokenType.LPAREN },
        { regex: /\)/, type: TokenType.RPAREN },
        { regex: /\[/, type: TokenType.LBRACKET },
        { regex: /\]/, type: TokenType.RBRACKET },
        { regex: /,/, type: TokenType.COMMA },
        { regex: /;/, type: TokenType.SEMICOLON },
        { regex: /[α-ωΑ-Ω]/, type: TokenType.IDENTIFIER },
        { regex: /[a-zA-Z_][a-zA-Z0-9_]*/, type: TokenType.IDENTIFIER }
    ];

    /** Current position in the input string. */
    private position = 0;

    /** Current line number in the input string. */
    private line = 1;

    /** Current column number in the input string. */
    private column = 1;

    /** List of tokens generated during lexical analysis. */
    private tokens: Token[] = [];

    /**
     * Creates a new Lexer instance.
     * 
     * @param {string} input - The mathematical formula string to tokenize.
     */
    constructor ( private readonly input: string ) {}

    /**
     * Scans the input string for the next token from the current position.
     * 
     * @returns {boolean} True if a token was successfully found and scanned, false otherwise.
     */
    private scanToken () : boolean {
        for ( const pattern of Lexer.PATTERN ) {
            const regex = new RegExp( `^${pattern.regex.source}` );
            const match = this.input.slice( this.position ).match( regex );

            if ( match ) {
                if ( ! pattern.skip ) this.tokens.push( {
                    type: pattern.type,
                    value: match[ 0 ],
                    position: this.getPos()
                } );

                this.advance( match[ 0 ] );
                return true;
            }
        }

        return false;
    }

    /**
     * Advances the internal pointers (position, line, column) based on the scanned text.
     * 
     * @param {string} text - The text that was just scanned.
     */
    private advance ( text: string ) : void {
        for ( const char of text ) {
            if ( char === '\n' ) { this.line++; this.column = 1 }
            else this.column++;
        }

        this.position += text.length;
    }

    /**
     * Returns the current position of the lexer as a Position object.
     * 
     * @returns {Position} An object representing the current line, column, and offset.
     */
    private getPos () : Position {
        return { line: this.line, column: this.column, offset: this.position };
    }


    /**
     * Tokenizes the input string and returns an array of Token objects.
     * 
     * @returns {Token[]} An array of tokens representing the input formula.
     * @throws {Error} If an unknown character is encountered.
     */
    public tokenize () : Token[] {
        this.tokens = [];
        this.position = 0;
        this.line = 1;
        this.column = 1;

        while ( this.position < this.input.length ) if ( ! this.scanToken() ) {
            throw new Error( `Lexer error at ${this.line}:${this.column}` );
        }

        this.tokens.push( {
            type: TokenType.EOF,
            value: '',
            position: this.getPos()
        } );

        return this.tokens;
    }

}
