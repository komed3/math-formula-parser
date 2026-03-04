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
