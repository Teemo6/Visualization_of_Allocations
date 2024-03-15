import * as vscode from 'vscode';
import * as path from 'path';

import { Loader } from './load/Loader';
import { Highlighter } from './highlight/Highlighter';
import { Constants } from './Constants';
import { AllocationRecord } from './model/json/AllocationRecord';
import { ClassRecord } from './model/lsp/ClassRecord';
import { AllocationKind } from './model/json/AllocationKind';
import { AllocationJSON } from './load/AllocationJSON';
import { DuplicateTrace } from './model/json/DuplicateTrace';
import { WebviewTable } from './webview/WebviewTable';

/**
 * Persistent extension object, keeps all loaded data and manages other modules
 */
export class ExtensionManager {
    /**
     * Extension context
     */
    public readonly context: vscode.ExtensionContext;

    private readonly loader: Loader = new Loader;
    private readonly highlighter: Highlighter = new Highlighter;
    private readonly webviewTable: WebviewTable = new WebviewTable;

    /**
     * Loadded JSON data from JSON file provided by Loader
     */
    private loadedJSON: AllocationJSON | undefined = undefined;
    /**
     * Map<"package.class", symbols in file> provided by Loader
     */
    private classFileMap: Map<string, ClassRecord> = new Map();
    /**
     * Map<"file path", all line data> => created mapping between JSON file an Java symbols
     */
    private allocationFileMap: Map<string, AllocationRecord[]> = new Map();

    /**
     * Pass extension context to persistent manager
     * @param context extension context
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Load JSON file, map Java symbols and highlight data
     */
    public async loadFile(): Promise<void> {
        // Load JSON file
        if (!await this.loader.loadJSONFile()) {
            return;
        }

        // Load Java symbols
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Memory Analyzer: Loading Java symbols",
            cancellable: false
        }, async () => {
            if (!await this.loader.loadProject()) {
                return;
            }
        });

        // Get all loaded data
        this.loadedJSON = this.loader.getAllocationJSON();
        this.classFileMap = this.loader.getFileMap();
        this.allocationFileMap = new Map();

        // Map symbols and JSON file
        if (!await this.mapSymbolsAndJSON()) {
            this.loadedJSON = undefined;
            this.classFileMap = new Map();
            this.allocationFileMap = new Map();
            vscode.window.showErrorMessage("Could not map JSON data to Java symbols");
            return;
        }

        // Give data to Highlighter
        this.stopShowingData();
        this.highlighter.loadAllFileData(this.allocationFileMap);
        this.startShowingData();
    }

    /**
     * Show webview panel with line allocation / duplicate details
     */
    public async showDetail(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }

        // Check activated highlighter
        if (!this.highlighter.isShowingData()) {
            vscode.window.showErrorMessage("Load JSON and toggle the visualization on first");
            return;
        }

        // Select active line
        const activeLineNumber = editor!.selection.active.line;
        const records = this.allocationFileMap.get(path.normalize(editor!.document.uri.path));
        if (!records) {
            vscode.window.showErrorMessage("Cannot find any data for the selected file");
            return;
        }

        // Gather all active line data
        const lineRecords: AllocationRecord[] = [];
        let start = Number.MAX_SAFE_INTEGER;
        let end = Number.MIN_SAFE_INTEGER;
        let activeLineKind = AllocationKind.LINE;
        let activeLineName = "";
        for (const r of records!) {
            if (r.line === activeLineNumber) {
                activeLineKind = r.kind;
                activeLineName = r.name;
                if (activeLineKind === AllocationKind.LINE || activeLineKind === AllocationKind.PARAMETER) {
                    activeLineKind = AllocationKind.LINE;
                    lineRecords.push(r);
                } else if (r.size !== 0) {
                    if (r.range !== undefined) {
                        start = r.range.start.line + 1;
                        end = r.range.end.line + 1;
                    }
                }
                break;
            }
        }

        // Get child data of class / method
        if (start !== Number.MAX_SAFE_INTEGER && end !== Number.MIN_SAFE_INTEGER) {
            for (const r of records!) {
                if (start <= r.line && r.line < end) {
                    if (activeLineKind === AllocationKind.CLASS && (r.kind === AllocationKind.METHOD || r.kind === AllocationKind.PARAMETER)) {
                        lineRecords.push(r);
                    }
                    if (activeLineKind === AllocationKind.METHOD && r.kind === AllocationKind.LINE) {
                        lineRecords.push(r);
                    }
                }
            }
        }

        // Init webview
        if (!this.webviewTable.hasActivePanel()) {
            this.webviewTable.createNewPanel(this);
        }

        // Send data to webview
        if (lineRecords.length === 0) {
            this.webviewTable.sendNothingToTable(activeLineNumber + 1);
        } else {
            const allocData: { name: string, size: number, count: number, source: string }[] = [];
            const dupeData: { name: string, size: number, count: number, source: string }[] = [];

            lineRecords.forEach(l => {
                if (l.size !== 0) {
                    allocData.push({ name: l.name, size: l.size, count: l.count, source: l.getJavaSource() });
                    l.duplicates.forEach(t => {
                        dupeData.push({ name: l.name, size: l.size, count: t.count, source: t.getJavaSource() });
                    });
                }
            });
            dupeData.sort((a, b) => a.source.localeCompare(b.source));

            this.webviewTable.sendDataToTable(activeLineNumber + 1, activeLineKind, activeLineName, allocData, dupeData);
        }
    }

    /**
     * Toggle between showing and not showing data
     */
    public toggleShowingData(): void {
        if (this.highlighter.isShowingData()) {
            this.stopShowingData();
        } else {
            this.startShowingData();
        }
    }

    /**
     * Highlight all visible editors
     */
    public highlightEditors(): void {
        this.highlighter.highlightEditors();
    }

    /**
     * Reload highlight
     */
    public reloadHighlights(): void {
        if (this.highlighter.isShowingData()) {
            this.stopShowingData();
            this.highlighter.loadAllFileData(this.allocationFileMap);
            this.startShowingData();
        }
    }

    /**
     * Open text editor and go to specified line, separates data with "deli" specified in Constants
     * @param exp format as following: \<package with class\>"deli"\<method\>"deli"\<line\> 
     */
    public async gotoLine(exp: string): Promise<void> {
        const parts = exp.split(Constants.DUPLICATE_DETAIL_DELI);
        if (this.classFileMap.has(parts[0])) {
            const document = await vscode.workspace.openTextDocument(this.classFileMap.get(parts[0])!.file);
            const editor = await vscode.window.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false
            });
            const intLine = parseInt(parts[1]) - 1;
            if (document.lineCount < parseInt(parts[1]) - 1) {
                vscode.window.showErrorMessage("Allocation line " + intLine + " out of bound");
                return;
            }
            const cursorPos = new vscode.Selection(new vscode.Position(intLine, 0), new vscode.Position(intLine, 0));
            editor.selection = cursorPos;
            editor.revealRange(cursorPos);

            // Show line details immediately
            if (vscode.workspace.getConfiguration(Constants.CONFIG_DETAILS).get<string>("goToLineImmediately")) {
                this.showDetail();
            }
        } else {
            console.error("Cannot find file " + parts[0]);
            vscode.window.showErrorMessage("Cannot find file " + parts[0]);
        }
    }

    /**
     * Map JSON data to Java symbols, prepare allocation records for every symbol
     * @returns bool operation successful/unsucessful
     */
    private async mapSymbolsAndJSON(): Promise<boolean> {
        if (!this.loadedJSON) {
            return false;
        }

        // Load line allocation data
        for (const l of this.loadedJSON.LINE) {
            // Editor is indexing from 0
            const editorLine = l.line - 1;

            // Nested call, trim it
            if (l.class.indexOf("$") !== -1) {
                const trim = l.class.substring(0, l.class.indexOf("$"));
                console.warn("Found nested symbol " + l.class + ":" + l.line + ", trimming to " + trim);
                l.class = trim;
            }

            // Find JSON class in workspace symbols
            if (this.classFileMap.has(l.class)) {
                // Get file by URI, convert line to document position, compare with class range
                const classRecord = this.classFileMap.get(l.class);
                const document = await vscode.workspace.openTextDocument(classRecord!.file);
                if (document.lineCount < l.line) {
                    console.error("Allocation line " + l.class + ":" + l.line + " out of bound for file " + classRecord!.file);
                    continue;
                }

                // Reduce line by offset
                const lineRange = new vscode.Range(new vscode.Position(editorLine, 0), new vscode.Position(editorLine, 0));
                const totalSize = l.size * l.count;

                if (classRecord!.range.contains(lineRange)) {
                    classRecord!.allocated += totalSize;

                    // Find which constructor/method does the line fit in, ranges are sorted
                    let foundMethod = false;
                    for (const con of classRecord!.constructors) {
                        if (con.range.contains(lineRange)) {
                            con.allocated += totalSize;
                            foundMethod = true;
                            break;
                        }
                    }

                    if (!foundMethod) {
                        for (const m of classRecord!.methods) {
                            if (m.range.contains(lineRange) && m.name.substring(0, m.name.indexOf("(")) === l.method) {
                                m.allocated += totalSize;
                                foundMethod = true;
                                break;
                            }
                        }
                    }

                    let allocationKind = AllocationKind.LINE;
                    if (!foundMethod) {
                        allocationKind = AllocationKind.PARAMETER;
                    }

                    // Add record to file
                    const lineRecord: AllocationRecord = new AllocationRecord(l.name, l.class, editorLine, allocationKind);
                    lineRecord.size = l.size;
                    lineRecord.count = l.count;
                    if (this.allocationFileMap.has(classRecord!.file)) {
                        this.allocationFileMap.get(classRecord!.file)!.push(lineRecord);
                    } else {
                        this.allocationFileMap.set(classRecord!.file, [lineRecord]);
                    }
                } else {
                    console.error("Allocation line " + l.class + ":" + l.line + " out of range [" + classRecord!.range.start.line + 1 + ", " + classRecord!.range.end.line + 1 + "]");
                    continue;
                }
            } else {
                console.error("Could not resolve class " + l.class + " of allocation " + l.class + ":" + l.method + ":" + l.line);
            }
        }

        // Load instance duplicate data
        for (const d of this.loadedJSON.DUPLICATE) {
            // Load every trace of duplicate
            const allTraces: DuplicateTrace[] = [];
            for (const rawTrace of d.traces) {

                // Nested call, trim it
                if (rawTrace.class.indexOf("$") !== -1) {
                    const trim = rawTrace.class.substring(0, rawTrace.class.indexOf("$"));
                    console.warn("Found nested symbol " + rawTrace.class + ":" + rawTrace.line + ", trimming to " + trim);
                    rawTrace.class = trim;
                }

                // Map trace to Java file
                if (this.classFileMap.has(rawTrace.class)) {
                    const tracePath = this.classFileMap.get(rawTrace.class)!.file;
                    allTraces.push(new DuplicateTrace(tracePath, rawTrace.class, rawTrace.method, rawTrace.line, rawTrace.count));
                } else {
                    console.error("Could not resolve class " + rawTrace.class + " of duplicate trace " + rawTrace.class + ":" + rawTrace.method + ":" + rawTrace.line);
                    continue;
                }
            }

            // Add trace info to allocation record
            for (const trace of allTraces) {
                for (const alloc of this.allocationFileMap.get(trace.file)!) {
                    if ((alloc.kind === AllocationKind.LINE || alloc.kind === AllocationKind.PARAMETER) && alloc.line === trace.line - 1 && alloc.name === d.name && alloc.size === d.size) {
                        alloc.dupeCount += d.duplicates;
                        alloc.duplicates.push(...allTraces);
                    }
                }
            }
        }

        // Fill allocationFileMap with aggregated method and class info
        this.classFileMap.forEach((c, c_key) => {
            const classRecord: AllocationRecord = new AllocationRecord(c_key, c_key, c.declared, AllocationKind.CLASS);
            classRecord.range = c.range;
            classRecord.size = c.allocated;
            if (this.allocationFileMap.has(c.file)) {
                this.allocationFileMap.get(c.file)!.push(classRecord);
            } else {
                this.allocationFileMap.set(c.file, [classRecord]);
            }
            c.methods.forEach(m => {
                const methodRecord: AllocationRecord = new AllocationRecord(m.name, c_key, m.declared, AllocationKind.METHOD);
                methodRecord.range = m.range;
                methodRecord.size = m.allocated;
                this.allocationFileMap.get(c.file)!.push(methodRecord);
            });
            c.constructors.forEach(con => {
                const constructorRecord: AllocationRecord = new AllocationRecord(con.name, c_key, con.declared, AllocationKind.METHOD);
                constructorRecord.range = con.range;
                constructorRecord.size = con.allocated;
                this.allocationFileMap.get(c.file)!.push(constructorRecord);
            });
        });
        return true;
    }

    /**
     * Hide highlight data
     */
    private stopShowingData(): void {
        this.highlighter.stopShowingData();
        this.webviewTable.closeActivePanel();
    }

    /**
     * Show highlight data (if any)
     */
    private startShowingData(): void {
        if (!this.highlighter.startShowingData()) {
            vscode.window.showErrorMessage("No data to show");
        }
    }
}