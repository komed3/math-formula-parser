# Math Formula Parser

The **Math Formula Parser** is a flexible library for parsing and analyzing mathematical formulas, implemented in TypeScript.
It provides tools to tokenize, parse into an Abstract Syntax Tree (AST), and perform various analyses on formulas, such as extracting variables, constants, and functions, as well as calculating formula depth and node counts.

The library is designed to be lightweight, easy to use, and extensible, making it suitable for a wide range of applications that involve processing mathematical expressions.

## Installation

Install from npm:

```bash
npm install math-formula-parser
```

## Usage

This library is distributed in multiple formats to support various development environments:

### ES Modules (ESM)

The default choice for modern projects, supporting tree-shaking and modern build tools (Vite, Webpack, etc.).

```ts
import { Formula } from 'math-formula-parser';

const formula = new Formula( 'sin(x) + pi' );
console.log( formula.ast );
```

### CommonJS (CJS)

Specifically designed for integration into standard Node.js applications.

```js
const { Formula } = require( 'math-formula-parser' );

const formula = new Formula( 'sin(x) + pi' );
console.log( formula.ast );
```

### UMD / Browser

For direct usage in the browser. You can include the script via CDN or from the `dist` folder. The library is exposed under the global variable `FormulaParser`.

```html
<script src="node_modules/math-formula-parser/dist/bundle.js"></script>
<script>
  const formula = new FormulaParser.Formula( 'sin(x) + pi' );
  console.log( formula.visualize() );
</script>
```

For production, it is recommended to use the minified version: `dist/bundle.min.js`.

## API reference

### Formula Class

#### Constructor

- `new Formula( formula?: string )`  
  Creates a new instance of `Formula`. If a formula string is provided, it is automatically parsed.

#### Analysis & Parsing

- `parse( formula: string ) : ASTNode`  
  Parses a mathematical formula string into an AST.
- `parseAndAnalyze( formula: string ) : AnalysisResult`  
  Parses a formula and performs a complete analysis, returning an object with AST, variables, constants, functions, depth, node count, and string representation.
- `getVariables( ast?: ASTNode ) : Set< string >`  
  Extracts all unique variable names from the formula's AST.
- `getConstants( ast?: ASTNode ) : Set< string >`  
  Extracts all unique constant names from the formula's AST.
- `getFunctions( ast?: ASTNode ) : Set< string >`  
  Extracts all unique function names from the formula's AST.
- `getDepth( ast?: ASTNode ) : number`  
  Calculates the maximum depth of the formula's AST.
- `getNodeCount( ast?: ASTNode ) : number`  
  Counts the total number of nodes in the formula's AST.

#### Visualization & Output

- `toString( ast?: ASTNode ) : string`  
  Returns a string representation of the formula's AST.
- `visualize( ast?: ASTNode, options?: VisualizationOptions ) : string`  
  Returns a visual tree-like string representation of the formula's AST.
- `visualizeCompact( ast?: ASTNode ) : string`  
  Returns a compact visual string representation of the formula's AST (same as `toString()`).
- `visualizeJSON( ast?: ASTNode, indent = 2 ) : string`  
  Returns a JSON string representation of the formula's AST.

#### Static Methods

- `Formula.instructionSet() : InstructionSet`  
  Returns an overview of the supported instruction set including version, constants, functions, and operators.
- `Formula.availableConstants() : Record< string, number >`  
  Returns a list of all available mathematical constants.
- `Formula.availableFunctions() : string[]`  
  Returns a list of all supported mathematical function names.

### Visualizer Class

The `Visualizer` class can be used independently for more control over AST visualization:

- `new Visualizer()`
- `visualize( node: ASTNode, options?: VisualizationOptions ) : string`

## Supported Elements

The parser supports:
- **Operators**: `=`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `||`, `&&`, `+`, `-`, `*`, `/`, `%`, `^`, `!`
- **Constants**: `pi`, `e`, `phi`, `sqrt2`, `sqrt3`, `sqrt5`, `infinity`
- **Functions**: Wide range of math functions (`sin`, `cos`, `log`, `sqrt`, `integral`, `sum`, `product`, `derivative`, etc.)
- **Complex Structures**: Matrices (`matrix(1, 2; 3, 4)`), Vectors (`[1, 2, 3]`), Ranges (`[0, 10]`)

----

Copyright (c) 2026 Paul Köhler (komed3). All rights reserved.  
Released under the MIT license. See LICENSE file in the project root for details.
