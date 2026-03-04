import type { Token, TokenPattern, Position } from './types';
import { TokenType } from './types';

export class Lexer {

    private position = 0;
    private line = 1;
    private column = 1;
    private tokens: Token[] = [];

    constructor ( private input: string ) {}

    public tokenize () : Token[] {
        this.tokens = [];
        this.position = 0;
        this.line = 1;
        this.column = 1;

        while ( this.position < this.input.length ) {
            if ( !this.scanToken() ) {
                throw new Error( `Lexer error at ${this.line}:${this.column}` );
            }
        }

        this.tokens.push( {
            type: TokenType.EOF,
            value: '',
            position: this.getPos(),
        } );

        return this.tokens;
    }

}
