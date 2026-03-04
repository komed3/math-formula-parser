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

    constructor ( public operator: string, public left: ASTNode, public right: ASTNode, position?: Position ) {
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
