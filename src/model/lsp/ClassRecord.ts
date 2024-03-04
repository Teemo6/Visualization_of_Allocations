import * as vscode from 'vscode';

import { MethodRecord } from './MethodRecord';

/**
 * Java class symbols found in workspace file
 */
export class ClassRecord {
    public file: string;
    public package: string;
    public name: string;
    public range: vscode.Range;
    public declared: number;
    public constructors: MethodRecord[] = [];
    public methods: MethodRecord[] = [];
    public allocated: number = 0;

    /**
     * Assign all provided parameters to object values
     * @param file Absolute string file path in current workspace
     * @param packag Class packages separated by dot (.)
     * @param name Class name
     * @param range Lines where the symbol is
     * @param declared Where is declaration line
     * @param methods Methods this class have
     * @param constructors Constructors this class have
     */
    constructor(file: string, packag: string, name: string, range: vscode.Range, declared: number, methods: { name: string, range: vscode.Range, declared: number }[], constructors: { name: string, range: vscode.Range, declared: number }[]) {
        this.file = file;
        this.package = packag;
        this.name = name;
        this.range = range;
        this.declared = declared;

        methods.forEach(m => {
            this.methods.push(new MethodRecord(m.name, m.range, m.declared));
        });

        constructors.forEach(c => {
            this.constructors.push(new MethodRecord(c.name, c.range, c.declared));
        });
    }
}