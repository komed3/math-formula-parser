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
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    LBRACKET = 'LBRACKET',
    RBRACKET = 'RBRACKET',
    LBRACE = 'LBRACE',
    RBRACE = 'RBRACE',
    COMMA = 'COMMA',
    SEMICOLON = 'SEMICOLON',
    COLON = 'COLON',
    INTEGRAL = 'INTEGRAL',
    SUMMATION = 'SUMMATION',
    PRODUCT = 'PRODUCT',
    SQRT = 'SQRT',
    DERIVATIVE = 'DERIVATIVE',
    PARTIAL = 'PARTIAL',
    FACTORIAL = 'FACTORIAL',
    UNDER = 'UNDER',
    ELLIPSIS = 'ELLIPSIS',
    EOF = 'EOF'
};

export interface Position {
    line: number;
    column: number;
    offset: number;
};

export type ASTNode = any;

export interface VisualizationOptions {
    showTypes?: boolean;
    showPositions?: boolean;
    indentSize?: number;
    compact?: boolean;
};
