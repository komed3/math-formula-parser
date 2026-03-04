import { Position } from './types';

export abstract class ASTNode {

    protected type!: string;
    protected position?: Position;

    constructor ( position?: Position ) {
        this.position = position;
    }

}
