import { MathFormulaParser } from '../src';

const parser = new MathFormulaParser();

// Basic parsing
const ast1 = parser.parse( '2 + 3 * 4' );
console.log( 'Input: 2 + 3 * 4' );
console.log( 'String:', parser.toString( ast1 ) );
