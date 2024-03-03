import * as vscode from 'vscode';

import { AllocationKind } from '../model/json/AllocationKind';

export class HighlightData {
    public decorator: vscode.TextEditorDecorationType;
    public line: vscode.Range[];
    public kind: AllocationKind;

    constructor(decorator: vscode.TextEditorDecorationType, line: vscode.Range[], kind: AllocationKind) {
        this.decorator = decorator;
        this.line = line;
        this.kind = kind;
    }
}