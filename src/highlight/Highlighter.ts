import * as vscode from 'vscode';

import { HighlightData } from './HighlightData';
import { Constants } from '../Constants';
import { AllocationRecord } from '../model/json/AllocationRecord';
import { AllocationKind } from '../model/json/AllocationKind';

export class Highlighter {
    // Key = file path
    // Value = all data to highlight in the file
    private highlightMap: Map<string, HighlightData[]> = new Map();

    private showingData: boolean = false;

    private createAllocationText(size: number, count: number, duplicates: number, kind: AllocationKind): vscode.TextEditorDecorationType {
        var bgColor, gutterPath, textColor;
        if (size === 0) {
            bgColor = Constants.COLOR_CONFIG.get<string>("emptyBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("emptyText");
            gutterPath = Constants.NO_ALLOCATION_GUTTER;
        } else if (kind === AllocationKind.LINE) {
            bgColor = Constants.COLOR_CONFIG.get<string>("lineBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("lineText");
            gutterPath = Constants.LINE_ALLOCATION_GUTTER;
        } else if (kind === AllocationKind.METHOD) {
            bgColor = Constants.COLOR_CONFIG.get<string>("methodBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("methodText");
            gutterPath = Constants.METHOD_ALLOCATION_GUTTER;
        } else {
            bgColor = Constants.COLOR_CONFIG.get<string>("classBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("classText");
            gutterPath = Constants.CLASS_ALLOCATION_GUTTER;
        }

        var text = " Allocated " + Intl.NumberFormat(Constants.NUMBER_LOCALE).format(size) + " Bytes";
        if (count !== 1) {
            text += " in " + count + " instances";
        }
        if (duplicates !== 0) {
            text += ", found " + duplicates + " duplicates";
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

    public loadAllFileData(fileAllocationMap: Map<string, AllocationRecord[]>): void {
        this.stopShowingData();
        this.highlightMap.clear();

        fileAllocationMap.forEach((data, file) => {
            // Group data by line
            let lineMap: Map<number, {size: number, count: number, dupes: number, kind: AllocationKind}[]> = new Map();
            data.forEach(r => {
                var val = {size: r.size, count: r.count, dupes: r.dupeCount, kind: r.kind};
                if (lineMap.has(r.line)) {
                    lineMap.get(r.line)!.push(val);
                } else {
                    lineMap.set(r.line, [val]);
                }
            });

            // Aggregate all data on line
            let highlights: HighlightData[] = [];
            for (var [line, arr] of lineMap){
                let allocSize: number = 0;
                let allocCount: number = 0;
                let dupeCount: number = 0;
                let recordKind: AllocationKind = AllocationKind.LINE;

                for (var val of arr){
                    allocSize += val.size * val.count;
                    allocCount += val.count;
                    dupeCount += val.dupes;
                    recordKind = val.kind;
                }

                var decorator = this.createAllocationText(allocSize, allocCount, dupeCount, recordKind);
                var range = [new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0))];
                highlights.push(new HighlightData(decorator, range, recordKind));
            }

            this.highlightMap.set(file, highlights);
        });
    }
}