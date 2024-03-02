import * as vscode from 'vscode';

import { MethodRecord } from './MethodRecord';

export class ClassRecord {
    public file: string;
    public package: string;
    public name: string;
    public range: vscode.Range;
    public declared: number;
    public constructors: MethodRecord[] = [];
    public methods: MethodRecord[] = [];
    public allocated: number = 0;

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