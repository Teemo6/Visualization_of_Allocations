import * as vscode from 'vscode';

import { Loader } from './load/Loader';
import { Highlighter } from './highlight/Highlighter';
import { isAllocationJSON } from './load/AllocationJSON';
import { Constants } from './Constants';
import { AllocationRecord } from './model/AllocationRecord';
import { ClassRecord } from './model/ClassRecord';
import { AllocationKind } from './model/AllocationKind';

export class ExtensionManager {
    private loader: Loader = new Loader;
    private highlighter: Highlighter = new Highlighter;

    public async runAnalyzer(): Promise<void> {
        vscode.window.setStatusBarMessage("Running analyzer");

        vscode.window.setStatusBarMessage("Done running analyzer");
    }

    public async loadFile(): Promise<void> {
        vscode.window.setStatusBarMessage("Loading JSON file");

        var LSP_EXTENSION_PROVIDER = vscode.extensions.getExtension(Constants.LSP_EXTENSION);
        if (!LSP_EXTENSION_PROVIDER) {
            vscode.window.showErrorMessage("Language support for Java is not present");
            return;
        }
        if (!LSP_EXTENSION_PROVIDER.isActive) {
            vscode.window.showErrorMessage("Language support for Java is not ready yet, try again later");
            return;
        }

        var loaded = await this.loader.loadProject();
        if (!loaded) {
            return;
        }

        // TODO: Better JSON loading
        var loadedJSON;
        try {
            let path: vscode.Uri = vscode.Uri.file("");
            var invalid = true;
            await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
            }).then(uri => {
                if (uri && uri[0]) {
                    path = uri[0];
                    invalid = false;
                }
            });
            if (invalid) {
                return;
            }
            var rawData = await vscode.workspace.fs.readFile(path);
            loadedJSON = await JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        if (!isAllocationJSON(loadedJSON)) {
            vscode.window.showErrorMessage("JSON file has unexpected format");
            return;
        }

        // Key = package.class
        // Value = class data
        let classFileMap: Map<string, ClassRecord> = this.loader.getFileMap();

        if (classFileMap.size === 0) {
            vscode.window.showErrorMessage("Language support for Java is not ready yet, try again later");
            return;
        }

        // Key = file Uri
        // Value = allocation data
        let allocationFileMap: Map<vscode.Uri, AllocationRecord[]> = new Map();

        // Load allocation data
        for (var l of loadedJSON.LINE) {
            // Anonymous call
            if (l.class.endsWith("$1")) {
                console.log("Got anonymous call " + l.class);
                l.class = l.class.substring(0, l.class.indexOf("$1"));
                console.log(l.class);
            }

            // Find JSON class in workspace symbols
            if (classFileMap.has(l.class)) {
                // Get file by URI, convert line to document position, compare with class range
                var classRecord = classFileMap.get(l.class);
                var document = await vscode.workspace.openTextDocument(classRecord!.file);
                if (document.lineCount < l.line) {
                    console.log("Invalid line");
                    continue;
                }

                var documentLine = document.lineAt(l.line).lineNumber - 1;
                var lineRange = new vscode.Range(new vscode.Position(documentLine, 0), new vscode.Position(documentLine, 0));
                var totalSize = l.size * l.count;

                if (classRecord!.range.contains(lineRange)) {
                    classRecord!.allocated += totalSize;

                    // Find which constructor/method does the line fit in
                    // Ranges are sorted
                    if (l.method === Constants.LINE_CONSTRUCTOR_STRING) {
                        for (var con of classRecord!.constructors) {
                            if (con.range.contains(lineRange)) {
                                con.allocated += totalSize;
                                break;
                            }
                        }
                    } else {
                        for (var m of classRecord!.methods) {
                            if (m.range.contains(lineRange)) {
                                m.allocated += totalSize;
                                break;
                            }
                        }
                    }
                    let lineRecord: AllocationRecord = new AllocationRecord(l.name, document.lineAt(l.line).lineNumber - 1, AllocationKind.LINE);
                    lineRecord.size = l.size;
                    lineRecord.count = l.count;
                    if (allocationFileMap.has(classRecord!.file)) {
                        allocationFileMap.get(classRecord!.file)!.push(lineRecord);
                    } else {
                        allocationFileMap.set(classRecord!.file, [lineRecord]);
                    }
                }
            } else {
                console.log("Could not resolve class " + l.class);
            }
        }

        classFileMap.forEach(c => {
            let classRecord: AllocationRecord = new AllocationRecord(c.name, c.declared, AllocationKind.CLASS);
            classRecord.size = c.allocated;
            if (allocationFileMap.has(c.file)) {
                allocationFileMap.get(c.file)!.push(classRecord);
            } else {
                allocationFileMap.set(c.file, [classRecord]);
            }
            c.methods.forEach(m => {
                let methodRecord: AllocationRecord = new AllocationRecord(m.name, m.declared, AllocationKind.METHOD);
                methodRecord.size = m.allocated;
                allocationFileMap.get(c.file)!.push(methodRecord);
            });
            c.constructors.forEach(con => {
                let methodRecord: AllocationRecord = new AllocationRecord(con.name, con.declared, AllocationKind.METHOD);
                methodRecord.size = con.allocated;
                allocationFileMap.get(c.file)!.push(methodRecord);
            });
        });

        this.highlighter.loadAllFileData(allocationFileMap);
        this.highlighter.startShowingData();

        vscode.window.setStatusBarMessage("Done loading JSON file");
        console.log("Done loading JSON file");
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
}