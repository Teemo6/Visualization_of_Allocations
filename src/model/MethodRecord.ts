import { Range } from 'vscode';

export class MethodRecord {
    public name: string;
    public range: Range;
    public declared: number;
    public allocated: number = 0;

    constructor(name: string, range: Range, declared: number) {
        this.name = name;
        this.range = range;
        this.declared = declared;
    }
}