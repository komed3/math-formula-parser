import { Position } from './types';

export abstract class ASTNode {
    protected type!: string;
    protected position?: Position;

    constructor ( position?: Position ) {
        this.position = position;
    }
}

export class NumberNode extends ASTNode {
    protected type = 'Number';
    constructor ( public value: number, position?: Position ) {
        super( position );
    }
}

export class VariableNode extends ASTNode {
    protected type = 'Variable';

    constructor ( public name: string, position?: Position ) {
        super( position );
    }
}

export class ConstantNode extends ASTNode {
    protected type = 'Constant';

    constructor ( public name: string, public value: number, position?: Position ) {
        super( position );
    }
}

export class BinaryOpNode extends ASTNode {
    protected type = 'BinaryOp';

    constructor (
        public operator: string, public left: ASTNode, public right: ASTNode,
        position?: Position
    ) {
        super( position );
    }
}

export class UnaryOpNode extends ASTNode {
    protected type = 'UnaryOp';

    constructor ( public operator: string, public operand: ASTNode, position?: Position ) {
        super( position );
    }
}

export class FunctionNode extends ASTNode {
    protected type = 'Function';

    constructor ( public name: string, public args: ASTNode[], position?: Position ) {
        super( position );
    }
}

export class GroupNode extends ASTNode {
    protected type = 'Group';

    constructor ( public expression: ASTNode, position?: Position ) {
        super( position );
    }
}

export class SqrtNode extends ASTNode {
    protected type = 'Sqrt';

    constructor ( public radicand: ASTNode, public degree?: ASTNode, position?: Position ) {
        super( position );
    }
}

export class PowerNode extends ASTNode {
    protected type = 'Power';

    constructor ( public base: ASTNode, public exponent: ASTNode, position?: Position ) {
        super( position );
    }
}

export class SummationNode extends ASTNode {
    protected type = 'Summation';

    constructor (
        public variable: string, public lower: ASTNode, public upper: ASTNode,
        public expression: ASTNode, position?: Position
    ) {
        super( position );
    }
}

export class ProductNode extends ASTNode {
    protected type = 'Product';

    constructor (
        public variable: string, public lower: ASTNode, public upper: ASTNode,
        public expression: ASTNode, position?: Position
    ) {
        super( position );
    }
}

export class IntegralNode extends ASTNode {
    protected type = 'Integral';

    constructor (
        public variable: string, public expression: ASTNode, public lower?: ASTNode,
        public upper?: ASTNode, position?: Position
    ) {
        super( position );
    }
}

export class DerivativeNode extends ASTNode {
    protected type = 'Derivative';

    constructor ( public variable: string, public expression: ASTNode, position?: Position ) {
        super( position );
    }
}

export class PartialDerivativeNode extends ASTNode {
    protected type = 'PartialDerivative';

    constructor ( public variable: string, public expression: ASTNode, position?: Position ) {
        super( position );
    }
}

export class VectorNode extends ASTNode {
    protected type = 'Vector';

    constructor ( public elements: ASTNode[], position?: Position ) {
        super( position );
    }
}

export class MatrixNode extends ASTNode {
    protected type = 'Matrix';

    constructor ( public rows: ASTNode[][], position?: Position ) {
        super( position );
    }
}

export class ComplexNode extends ASTNode {
    protected type = 'Complex';

    constructor ( public real: ASTNode, public imaginary: ASTNode, position?: Position ) {
        super( position );
    }
}
