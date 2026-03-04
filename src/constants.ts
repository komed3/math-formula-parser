export const MATH_CONSTANTS: Record< string, number > = {
    pi: Math.PI,
    e: Math.E,
    phi: ( 1 + Math.sqrt( 5 ) ) / 2,
    golden: ( 1 + Math.sqrt( 5 ) ) / 2,
    infinity: Infinity,
    nan: NaN,
    gamma: 0.5772156649,
    sqrt2: Math.sqrt( 2 ),
    sqrt3: Math.sqrt( 3 ),
    sqrt5: Math.sqrt( 5 ),
    ln2: Math.log( 2 ),
    ln10: Math.log( 10 )
};

export const MATH_FUNCTIONS: Set< string > = new Set( [
    // Trigonometric
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',

    // Inverse trigonometric
    'arcsin', 'arccos', 'arctan', 'arccot', 'arcsec', 'arccsc', 'asin', 'acos', 'atan',
    'acot', 'asec', 'acsc', 'sinh-1', 'cosh-1', 'tanh-1',

    // Hyperbolic
    'sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch',

    // Inverse hyperbolic
    'arcsinh', 'arccosh', 'arctanh', 'arccoth', 'arcsech', 'arccsch', 'asinh', 'acosh',
    'atanh', 'acoth', 'asech', 'acsch',

    // Exponential and logarithmic
    'exp', 'log', 'log2', 'log10', 'ln', 'log1p', 'expm1',

    // Power and roots
    'sqrt', 'cbrt', 'pow', 'root',

    // Absolute value and sign
    'abs', 'sign', 'round', 'floor', 'ceil', 'trunc', 'frac', 'integer', 'max', 'min',

    // Modulo and GCD/LCM
    'mod', 'rem', 'gcd', 'lcm',

    // Factorial and combinatorics
    'factorial', 'fact', 'gamma', 'lgamma', 'digamma', 'choose', 'perm', 'comb',

    // Special functions
    'erf', 'erfc', 'erfinv', 'beta', 'betainc', 'elliptic_k', 'elliptic_e', 'elliptic_pi',
    'bessel_j', 'bessel_y', 'bessel_i', 'bessel_k',

    // Hyperbolic and other
    'sinc', 'logit', 'sigmoid', 'tanh', 'softsign',

    // Statistical
    'mean', 'median', 'mode', 'variance', 'std', 'stddev', 'skewness', 'kurtosis',
    'covariance', 'correlation', 'quantile', 'percentile', 'cdf', 'pdf', 'pmf', 'norm',
    'normcdf', 'normpdf', 'norminv',

    // Rounding and truncation
    'round', 'floor', 'ceil', 'trunc', 'frac',

    // Calculus
    'sum', 'product', 'integral', 'derivative', 'partial', 'limit', 'lim', 'diff',

    // Vectors and matrices
    'matrix', 'vector', 'diag', 'eye', 'ones', 'zeros', 'determinant', 'det', 'trace',
    'rank', 'norm', 'transpose', 'inv', 'eig', 'svd', 'dot', 'cross', 'hadamard',

    // Other operations
    'neg', 'not', 'and', 'or', 'xor', 'hypot', 'atan2', 'copysign', 'ldexp', 'frexp', 'fmod',

    // Uncommon but useful
    'fma', 'next', 'prev', 'ulp', 'cbrt', 'log1p', 'expm1', 'hypot'
] );
