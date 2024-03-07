import * as vscode from 'vscode';

import { HighlightData } from './HighlightData';
import { Constants } from '../Constants';
import { AllocationRecord } from '../model/json/AllocationRecord';
import { AllocationKind } from '../model/json/AllocationKind';

export class Highlighter {
    /**
     * Map<"file path", all highlight data in the file>
     */
    private highlightMap: Map<string, HighlightData[]> = new Map();
    /**
     * Whether highlighter is currently showing data or not
     */
    private showingData: boolean = false;

    /**
     * Load AllocationRecord data for every file and convert them to HighlightData
     * @param fileAllocationMap Map<"file path", all line data>
     */
    public loadAllFileData(fileAllocationMap: Map<string, AllocationRecord[]>): void {
        // Reset editor highlight
        this.highlightMap.clear();

        fileAllocationMap.forEach((data, file) => {
            // Group data by line
            const lineMap: Map<number, { size: number, count: number, dupes: number, kind: AllocationKind }[]> = new Map();
            data.forEach(r => {
                const val = { size: r.size, count: r.count, dupes: r.dupeCount, kind: r.kind };
                if (lineMap.has(r.line)) {
                    lineMap.get(r.line)!.push(val);
                } else {
                    lineMap.set(r.line, [val]);
                }
            });

            // Aggregate all data on line
            const highlights: HighlightData[] = [];
            for (const [line, arr] of lineMap) {
                let allocSize: number = 0;
                let allocCount: number = 0;
                let dupeCount: number = 0;
                let recordKind: AllocationKind = AllocationKind.LINE;

                for (const val of arr) {
                    allocSize += val.size * val.count;
                    allocCount += val.count;
                    dupeCount += val.dupes;
                    recordKind = val.kind;
                }

                const decorator = this.createAllocationText(allocSize, allocCount, dupeCount, recordKind);
                const range = [new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0))];
                highlights.push(new HighlightData(decorator, range, recordKind));
            }
            this.highlightMap.set(file, highlights);
        });
    }

    /**
     * Highlight all visible editors according to highlightMap, VSCode event response
     */
    public highlightEditors(): void {
        if (!this.showingData) {
            return;
        }

        // Get all visible editors
        const editors = vscode.window.visibleTextEditors;
        if (!editors) {
            return;
        }

        // Add highlights according to the file map
        for (const editor of editors) {
            const path = editor.document.uri.path;
            if (this.highlightMap.has(path)) {
                this.highlightMap.get(path)!.forEach(e => {
                    editor.setDecorations(e.decorator, e.line);
                });
            }
        }
    }

    /**
     * Highlight all visible editors according to highlightMap data (if any), user active event response
     * @returns showing data was successful/unsucessful
     */
    public startShowingData(): boolean {
        if (this.highlightMap.size === 0) {
            return false;
        }

        this.showingData = true;
        this.highlightEditors();

        return true;
    }

    /**
     * Hide all editor highlights, user active event response
     */
    public stopShowingData(): void {
        if (!this.showingData) {
            return;
        }
        this.showingData = false;

        // Get all visible editors
        const editors = vscode.window.visibleTextEditors;
        if (!editors) {
            return;
        }

        // Add highlights according to the file map
        for (const editor of editors) {
            const path = editor.document.uri.path;
            if (this.highlightMap.has(path)) {
                this.highlightMap.get(path)!.forEach(e => {
                    editor.setDecorations(e.decorator, []);
                });
            }
        }
    }

    /**
     * @returns highlighter is showing/not showing data
     */
    public isShowingData(): boolean {
        return this.showingData;
    }

    /**
     * Create decorator for HighlightData object
     * @param size sum of allocated size in Bytes on single line
     * @param count how many instances did the allocation
     * @param duplicates sum of all duplicates on single line
     * @param kind kind of allocation provided
     * @returns line decorator
     */
    private createAllocationText(size: number, count: number, duplicates: number, kind: AllocationKind): vscode.TextEditorDecorationType {
        let bgColor, gutterPath, textColor;
        if (size === 0) {
            bgColor = Constants.COLOR_CONFIG.get<string>("emptyBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("emptyText");
            // gutterPath = Constants.NO_ALLOCATION_GUTTER;
        } else if (kind === AllocationKind.LINE) {
            bgColor = Constants.COLOR_CONFIG.get<string>("lineBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("lineText");
            // gutterPath = Constants.LINE_ALLOCATION_GUTTER;
        } else if (kind === AllocationKind.METHOD) {
            bgColor = Constants.COLOR_CONFIG.get<string>("methodBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("methodText");
            // gutterPath = Constants.METHOD_ALLOCATION_GUTTER;
        } else {
            bgColor = Constants.COLOR_CONFIG.get<string>("classBackground");
            textColor = Constants.COLOR_CONFIG.get<string>("classText");
            // gutterPath = Constants.CLASS_ALLOCATION_GUTTER;
        }

        let text = " Total of " + Intl.NumberFormat(Constants.NUMBER_LOCALE).format(size) + " Bytes";
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
            // gutterIconPath: gutterPath,
            // gutterIconSize: "contain",
            after: {
                contentText: text,
                color: textColor
            }
        });
    }
}