import * as vscode from 'vscode';

import { Loader } from './load/Loader';
import { Highlighter } from './highlight/Highlighter';
import { Constants } from './Constants';
import { AllocationRecord } from './model/AllocationRecord';
import { ClassRecord } from './model/ClassRecord';
import { AllocationKind } from './model/AllocationKind';
import { DuplicateRecord } from './model/DuplicateRecord';

export class ExtensionManager {
    private loader: Loader = new Loader;
    private highlighter: Highlighter = new Highlighter;

    private loadedJSON: any;
    private classFileMap: Map<string, ClassRecord> = new Map();                     // Map <"package.class", symbols in class>
    private allocationFileMap: Map<vscode.Uri, AllocationRecord[]> = new Map();     // Map <file path, all line data>

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
            return;
        }

        // Give data to Highlighter
        this.highlighter.loadAllFileData(this.allocationFileMap);
        this.highlighter.startShowingData();

        vscode.window.setStatusBarMessage("Done loading JSON file");
    }

    public async showDetail(): Promise<void> {

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

    private async mapSymbolsAndJSON(): Promise<boolean> {

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
            // Editor is indexing from 0
            var editorLine = d.line - 1;   

            // Anonymous call, rename it
            if (d.class.endsWith("$1")) {
                d.class = d.class.substring(0, d.class.indexOf("$1"));
            }

            // Find JSON class in workspace symbols
            if (this.classFileMap.has(d.class)) {
                // Get file by URI, convert line to document position, compare with class range
                var classFile = this.classFileMap.get(d.class)!.file;
                let duplicate: DuplicateRecord = new DuplicateRecord(d.size, d.duplicates);

                for (var alloc of this.allocationFileMap.get(classFile)!) {
                    if (alloc.line === editorLine) {
                        alloc.duplicates.push(duplicate);
                        break;
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