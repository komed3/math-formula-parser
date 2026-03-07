import type { ASTNode } from './ast';
import type { OperatorSpec, Position, VisualizationOptions } from './types';
import { TokenType } from './types';

export const OPERATORS: OperatorSpec[] = [
    { symbol: '=', token: TokenType.EQUAL, precedence: 1, associativity: 'right', label: 'assign', description: 'assignment/comparison' },
    { symbol: '==', token: TokenType.EQUAL, precedence: 2, associativity: 'left', label: 'equal', description: 'equality' },
    { symbol: '!=', token: TokenType.NOT_EQUAL, precedence: 2, associativity: 'left', label: 'not equal', description: 'inequality' },
    { symbol: '<', token: TokenType.LESS_THAN, precedence: 3, associativity: 'left', label: 'lower than' },
    { symbol: '>', token: TokenType.GREATER_THAN, precedence: 3, associativity: 'left', label: 'greater than' },
    { symbol: '<=', token: TokenType.LESS_EQUAL, precedence: 3, associativity: 'left', label: 'lower than equal' },
    { symbol: '>=', token: TokenType.GREATER_EQUAL, precedence: 3, associativity: 'left', label: 'greater than equal' },
    { symbol: '||', token: TokenType.OR, precedence: 4, associativity: 'left', label: 'or' },
    { symbol: '&&', token: TokenType.AND, precedence: 5, associativity: 'left', label: 'and' },
    { symbol: '+', token: TokenType.PLUS, precedence: 6, associativity: 'left', isPrefix: true, label: 'addition' },
    { symbol: '-', token: TokenType.MINUS, precedence: 6, associativity: 'left', isPrefix: true, label: 'subtraction' },
    { symbol: '*', token: TokenType.MULTIPLY, precedence: 7, associativity: 'left', label: 'multiplication' },
    { symbol: '/', token: TokenType.DIVIDE, precedence: 7, associativity: 'left', label: 'division' },
    { symbol: '%', token: TokenType.MODULO, precedence: 7, associativity: 'left', label: 'modulo' },
    { symbol: '^', token: TokenType.POWER, precedence: 13, associativity: 'right', label: 'power' },
    { symbol: '!', token: TokenType.NOT, precedence: 14, associativity: 'left', isPostfix: true, label: 'factorial' }
];

export const OPERATOR_BY_SYMBOL = new Map( OPERATORS.map( ( o ) => [ o.symbol, o ] ) );
export const OPERATOR_BY_TOKEN = new Map( OPERATORS.map( ( o ) => [ o.token, o ] ) );

export const IMPLICIT_MULTIPLICATION_TOKENS = new Set< TokenType >( [
    TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.LPAREN, TokenType.LBRACKET
] );

export const FUNCTIONS = new Set< string >( [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'asinh', 'acosh', 'atanh',
    'exp', 'log', 'ln', 'log10', 'log1p', 'exp2', 'sqrt', 'cbrt', 'abs',
    'floor', 'ceil', 'round', 'max', 'min', 'pow', 'root', 'mod', 'rem',
    'gcd', 'lcm', 'factorial', 'fact', 'choose', 'perm', 'comb', 'beta', 'betainc',
    'gamma', 'digamma', 'erf', 'erfc', 'erfinv',
    'bessel_j', 'bessel_y', 'bessel_i', 'bessel_k',
    'elliptic_k', 'elliptic_e',
    'sinc', 'sigmoid', 'logit', 'softsign',
    'mean', 'median', 'variance', 'stddev', 'skewness', 'kurtosis',
    'covariance', 'correlation', 'quantile', 'percentile',
    'normpdf', 'normcdf', 'norminv', 'pdf', 'cdf', 'pmf',
    'sum', 'product', 'integral', 'derivative', 'partial', 'limit', 'lim',
    'matrix', 'vector', 'det', 'trace', 'rank', 'norm', 'transpose', 'inv', 'eig', 'svd',
    'dot', 'cross', 'hadamard', 'hypot', 'atan2', 'copysign', 'ldexp', 'frexp', 'fmod', 'fma',
    'next', 'prev', 'ulp'
] );

export const CONSTANTS: Record< string, number > = {
    'pi': Math.PI,
    'e': Math.E,
    'phi': ( 1 + Math.sqrt( 5 ) ) / 2,
    'sqrt2': Math.SQRT2,
    'sqrt3': Math.sqrt( 3 ),
    'sqrt5': Math.sqrt( 5 ),
    'infinity': Infinity
};

export const FUNCTION_ALIASES: Record< string, string > = {
    'Σ': 'sum',
    'Π': 'product',
    'd': 'derivative',
    'dx': 'derivative',
    '∂': 'partial'
};

export type NodeFactory = ( kind: string, props: Record< string, any >, position?: Position ) => ASTNode;
export type FunctionBuilder = ( create: NodeFactory, args: ASTNode[], position?: Position ) => ASTNode;
