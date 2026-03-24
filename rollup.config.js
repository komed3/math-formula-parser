import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import esbuild from 'rollup-plugin-esbuild';


// Get package.json and git hash for the banner
const pkg = JSON.parse( readFileSync( new URL( './package.json', import.meta.url ) ) );
const gitHash = execSync( 'git rev-parse --short HEAD' ).toString().trim();

// Set the name of the UMD bundle
const name = 'FormulaParser';

// Create the banner
const banner = `/**
 * ${pkg.name} v${pkg.version}
 * (c) 2026 ${pkg.author.name}
 * License: ${pkg.license}
 * Build Date: ${ new Date().toISOString().split( 'T' )[ 0 ] }
 * Git Commit: ${gitHash}
 */`;

// Common plugins configuration
const commonEsbuildOptions = {
    target: 'esnext',
    tsconfig: './tsconfig.json',
    legalComments: 'none'
};

/**
 * Creates a terser plugin instance that strips comments but keeps code readable.
 * 
 * @param {boolean} minify - Whether to minify the code.
 * @returns {import( 'rollup' ).Plugin}
 */
const getTerserPlugin = ( minify = false ) => terser( {
    mangle: minify,
    compress: minify,
    format: {
        comments: false,
        beautify: !minify,
        preamble: banner
    }
} );

// Common plugins configuration
const plugins = [
    esbuild( {
        ...commonEsbuildOptions,
        minify: false,
    } ),
    resolve(),
    commonjs()
];


// Export the Rollup configuration
export default [
    // 1. Separate files for ESM and CJS
    {
        input: [
            'src/index.ts',
            'src/ast.ts',
            'src/definitions.ts',
            'src/formatter.ts',
            'src/formula.ts',
            'src/lexer.ts',
            'src/parser.ts',
            'src/types.ts',
            'src/visualizer.ts'
        ],
        output: [ {
            dir: 'dist/esm',
            format: 'esm',
            entryFileNames: '[name].mjs',
            preserveModules: true,
            preserveModulesRoot: 'src',
            plugins: [ getTerserPlugin( false ) ]
        }, {
            dir: 'dist/cjs',
            format: 'cjs',
            entryFileNames: '[name].cjs',
            preserveModules: true,
            preserveModulesRoot: 'src',
            exports: 'named',
            plugins: [ getTerserPlugin( false ) ]
        } ],
        plugins
    },
    // 2. UMD bundle for direct usage in browser (index.umd.js)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name,
            exports: 'named',
            sourcemap: false,
            plugins: [ getTerserPlugin( false ) ]
        },
        plugins
    },
    // 3. Minified UMD bundle (index.umd.min.js)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.umd.min.js',
            format: 'umd',
            name,
            exports: 'named',
            sourcemap: false,
            plugins: [ getTerserPlugin( true ) ]
        },
        plugins: [
            esbuild( {
                ...commonEsbuildOptions,
                minify: false
            } ),
            resolve(),
            commonjs()
        ]
    }
];
