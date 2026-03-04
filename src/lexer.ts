import type { Token, TokenPattern, Position } from './types';
import { TokenType } from './types';

export class Lexer {

    private position = 0;
    private line = 1;
    private column = 1;
    private tokens: Token[] = [];

    constructor ( private input: string ) {}

}
