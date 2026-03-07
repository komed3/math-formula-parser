import type { Token, TokenPattern, Position } from './types';
import { TokenType } from './types';


export class Lexer {

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

    private position = 0;
    private line = 1;
    private column = 1;
    private tokens: Token[] = [];

    constructor ( private readonly input: string ) {}

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

    private advance ( text: string ) : void {
        for ( const char of text ) {
            if ( char === '\n' ) { this.line++; this.column = 1 }
            else this.column++;
        }

        this.position += text.length;
    }

    private getPos () : Position {
        return { line: this.line, column: this.column, offset: this.position };
    }

}
