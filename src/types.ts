export enum TokenType {
    WHITESPACE = 'WHITESPACE',
    NUMBER = 'NUMBER',
    IDENTIFIER = 'IDENTIFIER',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    DIVIDE = 'DIVIDE',
    POWER = 'POWER',
    MODULO = 'MODULO',
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    LESS_THAN = 'LESS_THAN',
    GREATER_THAN = 'GREATER_THAN',
    LESS_EQUAL = 'LESS_EQUAL',
    GREATER_EQUAL = 'GREATER_EQUAL',
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT',
    UNDER = 'UNDER',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    LBRACKET = 'LBRACKET',
    RBRACKET = 'RBRACKET',
    COMMA = 'COMMA',
    SEMICOLON = 'SEMICOLON',
    ELLIPSIS = 'ELLIPSIS',
    EOF = 'EOF'
}

export type Associativity = 'left' | 'right';

export interface OperatorSpec {
    symbol: string;
    token: TokenType;
    precedence: number;
    associativity: Associativity;
    isPrefix?: boolean;
    isPostfix?: boolean;
    description?: string;
    label?: string;
}

export interface Position {
    line: number;
    column: number;
    offset: number;
}

export interface Token {
    type: TokenType;
    value: string;
    position: Position;
}

export interface TokenPattern {
    regex: RegExp;
    type: TokenType;
    skip?: boolean;
}

export interface VisualizationOptions {
    showTypes?: boolean;
    showPositions?: boolean;
    indentSize?: number;
    compact?: boolean;
}
