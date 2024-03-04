import * as vscode from 'vscode';

import { AllocationKind } from '../model/json/AllocationKind';

/**
 * Object that stores line highligh information
 */
export class HighlightData {
    public decorator: vscode.TextEditorDecorationType;
    public line: vscode.Range[];
    public kind: AllocationKind;

    /**
     * Assign all provided parameters to object values
     * @param decorator line highlight information
     * @param line range containing single line in document indexed from 0
     * @param kind kind of allocation provided
     */
    constructor(decorator: vscode.TextEditorDecorationType, line: vscode.Range[], kind: AllocationKind) {
        this.decorator = decorator;
        this.line = line;
        this.kind = kind;
    }
}