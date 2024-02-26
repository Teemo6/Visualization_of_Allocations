import * as vscode from 'vscode';

import { HighlightData } from './HighlightData';
import { Constants } from '../Constants';
import { AllocationRecord } from '../model/AllocationRecord';
import { AllocationKind } from '../model/AllocationKind';

export class Highlighter {
    // Key = file path
    // Value = all data to highlight in the file
    private highlightMap: Map<string, HighlightData[]> = new Map();

    private showingData: boolean = false;

    private createAllocationText(size: number, count: number, kind: AllocationKind): vscode.TextEditorDecorationType {
        var bgColor, gutterPath, textColor;
        if (size === 0) {
            bgColor = Constants.NO_ALLOCATION_BACKGROUND;
            gutterPath = Constants.NO_ALLOCATION_GUTTER;
            textColor = Constants.NO_ALLOCATION_TEXT;
        } else if (kind === AllocationKind.LINE) {
            bgColor = Constants.LINE_ALLOCATION_BACKGROUND;
            gutterPath = Constants.LINE_ALLOCATION_GUTTER;
            textColor = Constants.LINE_ALLOCATION_TEXT;
        } else if (kind === AllocationKind.METHOD) {
            bgColor = Constants.METHOD_ALLOCATION_BACKGROUND;
            gutterPath = Constants.METHOD_ALLOCATION_GUTTER;
            textColor = Constants.METHOD_ALLOCATION_TEXT;
        } else {
            bgColor = Constants.CLASS_ALLOCATION_BACKGROUND;
            gutterPath = Constants.CLASS_ALLOCATION_GUTTER;
            textColor = Constants.CLASS_ALLOCATION_TEXT;
        }

        var text = " Allocated " + Intl.NumberFormat(Constants.NUMBER_LOCALE).format(size * count) + " Bytes";
        if (count !== 1) {
            text += " in " + count + " instances";
        }

        return vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: bgColor,
            overviewRulerColor: bgColor,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            gutterIconPath: gutterPath,
            gutterIconSize: "contain",
            after: {
                contentText: text,
                color: textColor
            }
        });
    }

    public highlightEditors(): void {
        if (!this.showingData) {
            return;
        }

        // Get all visible editors
        var editors = vscode.window.visibleTextEditors;
        if (!editors) {
            return;
        }

        // Add highlights according to the file map
        for (var editor of editors) {
            var path = editor.document.uri.path;
            if (this.highlightMap.has(path)) {
                this.highlightMap.get(path)!.forEach(e => {
                    editor.setDecorations(e.decorator, e.line);
                });
            }
        }
    }

    public startShowingData(): boolean {
        if (this.highlightMap.size === 0) {
            return false;
        }

        this.showingData = true;
        this.highlightEditors();

        return true;
    }

    public stopShowingData(): void {
        if (!this.showingData) {
            return;
        }

        // Get all visible editors
        var editors = vscode.window.visibleTextEditors;
        if (!editors) {
            return;
        }

        // Add highlights according to the file map
        for (var editor of editors) {
            var path = editor.document.uri.path;
            if (this.highlightMap.has(path)) {
                this.highlightMap.get(path)!.forEach(e => {
                    editor.setDecorations(e.decorator, []);
                });
            }
        }
    }

    public loadAllFileData(fileAllocationMap: Map<vscode.Uri, AllocationRecord[]>): void {
        this.stopShowingData();
        this.highlightMap.clear();

        fileAllocationMap.forEach((data, file) => {
            let highlights: HighlightData[] = [];
            data.forEach(record => {
                var decorator = this.createAllocationText(record.size, record.count, record.kind);
                var range = [new vscode.Range(new vscode.Position(record.line, 0), new vscode.Position(record.line, 0))];
                highlights.push(new HighlightData(decorator, range, record.kind));
            });
            this.highlightMap.set(file.path, highlights);
        });
    }
}