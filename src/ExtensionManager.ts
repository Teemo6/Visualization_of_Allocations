import * as vscode from 'vscode';

import { Loader } from './load/Loader';
import { Highlighter } from './highlight/Highlighter';
import { Constants } from './Constants';
import { AllocationRecord } from './model/json/AllocationRecord';
import { ClassRecord } from './model/lsp/ClassRecord';
import { AllocationKind } from './model/json/AllocationKind';
import { AllocationJSON } from './load/AllocationJSON';
import { DuplicateTrace } from './model/json/DuplicateTrace';

export class ExtensionManager {
    private readonly extensionUri: vscode.Uri;

    private readonly loader: Loader = new Loader;
    private readonly highlighter: Highlighter = new Highlighter;

    private loadedJSON: AllocationJSON | undefined = undefined;                     // JSON data => got from Loader JSON file
    private classFileMap: Map<string, ClassRecord> = new Map();                     // Map <"package.class", symbols in class> => got from Loader Java symbols
    private allocationFileMap: Map<string, AllocationRecord[]> = new Map();         // Map <file path, all line data> => created mapping between JSON an Java symbols

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    public async runAnalyzer(): Promise<void> {
        vscode.window.setStatusBarMessage("Running analyzer");

        vscode.window.setStatusBarMessage("Done running analyzer");
    }

    public async loadFile(): Promise<void> {
        vscode.window.setStatusBarMessage("Loading JSON file");

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
            return;
        }

        // Give data to Highlighter
        this.highlighter.loadAllFileData(this.allocationFileMap);
        this.highlighter.startShowingData();

        vscode.window.setStatusBarMessage("Done loading JSON file");
    }

    public async showDetail(): Promise<void> {
        vscode.window.setStatusBarMessage("Showing line details");

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
        }

        // Select active line
        let activeLine = editor!.selection.active.line;
        let records = this.allocationFileMap.get(editor!.document.uri.path);
        if (!records) {
            vscode.window.showErrorMessage('Nothing to show');
            return;
        }

        let lineRecords: AllocationRecord[] = [];
        for (var r of records!) {
            if (r.kind === AllocationKind.LINE && r.line === activeLine) {
                lineRecords.push(r);
            }
        }

        // Webview
        let panel = vscode.window.createWebviewPanel("analyzerView", "Memory Analyzer", vscode.ViewColumn.Two, {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        });
        panel.webview.html = this.getHTML(panel.webview);

        // Send data to webview
        if (lineRecords.length === 0 || lineRecords[0].kind !== AllocationKind.LINE) {
            panel.webview.postMessage({ type: "noData", line: activeLine + 1 });
        } else {
            console.log(lineRecords);
            let allocData: { name: string, size: number, count: number }[] = [];
            let dupeData: { name: string, size: number, count: number, source: string }[] = [];

            lineRecords.forEach(l => {
                allocData.push({ name: l.name, size: l.size, count: l.count });
                l.duplicates.forEach(t => {
                    dupeData.push({ name: l.name, size: l.size, count: t.count, source: t.getJavaSource() });
                });
            });

            panel.webview.postMessage({
                type: 'data',
                line: activeLine + 1,
                allocData: allocData,
                dupeData: dupeData
            });
        }

        vscode.window.setStatusBarMessage("Done showing line details");
    }

    private getHTML(webview: vscode.Webview) {
        let scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "src", "webview", "main.js"));
        let cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "src", "webview", "main.css"));

        // Run only scripts secured by random nonce
        let nonce = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                <link href="${cssUri}" rel="stylesheet">
                
                <title>Memory Analyzer</title>
            </head>
            <body>
                <div id="alloc"></div>
                <div id="dupe"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    public stopShowingData(): void {
        this.highlighter.stopShowingData();
    }

    public startShowingData(): void {
        if (!this.highlighter.startShowingData()) {
            vscode.window.showErrorMessage("No data to show");
        }
    }

    public highlightEditors(): void {
        this.highlighter.highlightEditors();
    }

    public updateConfig(): void {
        Constants.updateConfiguration();
    }

    private async mapSymbolsAndJSON(): Promise<boolean> {
        if (!this.loadedJSON) {
            return false;
        }

        // Load line allocation data
        for (var l of this.loadedJSON.LINE) {
            // Editor is indexing from 0
            var editorLine = l.line - 1;

            // Anonymous call, trim it
            if (l.class.endsWith("$1")) {
                l.class = l.class.substring(0, l.class.indexOf("$1"));
            }

            // Find JSON class in workspace symbols
            if (this.classFileMap.has(l.class)) {
                // Get file by URI, convert line to document position, compare with class range
                var classRecord = this.classFileMap.get(l.class);
                var document = await vscode.workspace.openTextDocument(classRecord!.file);
                if (document.lineCount < l.line) {
                    vscode.window.showErrorMessage("Allocation line " + l.class + ":" + l.line + " out of bound");
                    return false;
                }

                // Reduce line by offset
                var lineRange = new vscode.Range(new vscode.Position(editorLine, 0), new vscode.Position(editorLine, 0));
                var totalSize = l.size * l.count;

                if (classRecord!.range.contains(lineRange)) {
                    classRecord!.allocated += totalSize;

                    // Find which constructor/method does the line fit in, ranges are sorted
                    if (l.method === Constants.LINE_CONSTRUCTOR_STRING) {
                        for (var con of classRecord!.constructors) {
                            if (con.range.contains(lineRange)) {
                                con.allocated += totalSize;
                                break;
                            }
                        }
                    } else {
                        for (var m of classRecord!.methods) {
                            if (m.range.contains(lineRange) && m.name.substring(0, m.name.indexOf("(")) === l.method) {
                                m.allocated += totalSize;
                                break;
                            }
                        }
                    }
                    let lineRecord: AllocationRecord = new AllocationRecord(l.name, editorLine, AllocationKind.LINE);
                    lineRecord.size = l.size;
                    lineRecord.count = l.count;
                    if (this.allocationFileMap.has(classRecord!.file)) {
                        this.allocationFileMap.get(classRecord!.file)!.push(lineRecord);
                    } else {
                        this.allocationFileMap.set(classRecord!.file, [lineRecord]);
                    }
                }
            } else {
                console.log("Could not resolve class " + l.class);
            }
        }

        // Load instance duplicate data
        for (var d of this.loadedJSON.DUPLICATE) {
            // Load every trace of duplicate
            let allTraces: DuplicateTrace[] = [];
            for (var rawTrace of d.traces) {
                // Anonymous call, rename it
                if (rawTrace.class.endsWith("$1")) {
                    rawTrace.class = rawTrace.class.substring(0, rawTrace.class.indexOf("$1"));
                }

                // Map trace to Java file
                if (this.classFileMap.has(rawTrace.class)) {
                    let tracePath = this.classFileMap.get(rawTrace.class)!.file;
                    allTraces.push(new DuplicateTrace(tracePath, rawTrace.class, rawTrace.method, rawTrace.line, rawTrace.count));
                }
            }

            // Add trace info to allocation record
            for (var trace of allTraces) {
                for (var alloc of this.allocationFileMap.get(trace.file)!) {
                    if (alloc.kind === AllocationKind.LINE && alloc.line === trace.line - 1 && alloc.name === d.name && alloc.size === d.size) {
                        alloc.dupeCount = d.duplicates;
                        alloc.duplicates = allTraces;
                    }
                }
            }
        }

        // Fill allocationFileMap with aggregated method and class info
        this.classFileMap.forEach(c => {
            let classRecord: AllocationRecord = new AllocationRecord(c.name, c.declared, AllocationKind.CLASS);
            classRecord.size = c.allocated;
            if (this.allocationFileMap.has(c.file)) {
                this.allocationFileMap.get(c.file)!.push(classRecord);
            } else {
                this.allocationFileMap.set(c.file, [classRecord]);
            }
            c.methods.forEach(m => {
                let methodRecord: AllocationRecord = new AllocationRecord(m.name, m.declared, AllocationKind.METHOD);
                methodRecord.size = m.allocated;
                this.allocationFileMap.get(c.file)!.push(methodRecord);
            });
            c.constructors.forEach(con => {
                let methodRecord: AllocationRecord = new AllocationRecord(con.name, con.declared, AllocationKind.METHOD);
                methodRecord.size = con.allocated;
                this.allocationFileMap.get(c.file)!.push(methodRecord);
            });
        });
        return true;
    }
}