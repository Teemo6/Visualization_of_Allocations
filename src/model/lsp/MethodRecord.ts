import { Range } from 'vscode';

/**
 * Java method symbols found in workspace file
 */
export class MethodRecord {
    public name: string;
    public range: Range;
    public declared: number;
    public allocated: number = 0;

    /**
     * Assign all provided parameters to object values
     * @param name Full name of method with brackets and parameters
     * @param range Lines where the symbol is
     * @param declared Where is declaration line
     */
    constructor(name: string, range: Range, declared: number) {
        this.name = name;
        this.range = range;
        this.declared = declared;
    }
}