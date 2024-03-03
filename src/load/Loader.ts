import * as vscode from 'vscode';
import path from 'path';

import { ClassRecord } from '../model/lsp/ClassRecord';
import { AllocationJSON, createAllocationJSON } from './AllocationJSON';
import { Constants } from '../Constants';

export class Loader {
    private loadedJSON: AllocationJSON | undefined = undefined;
    private classFileMap: Map<string, ClassRecord> = new Map();     // Map <"package.class", symbols in class>

    public async loadJSONFile(): Promise<boolean> {
        this.loadedJSON = undefined;

        try {
            let jsonPath: vscode.Uri = vscode.Uri.file("");
            let userDefined = Constants.JSON_CONFIG.get<string>("defaultPath");
            if (userDefined) {
                jsonPath = vscode.Uri.parse("file:/" + userDefined);
                vscode.window.showInformationMessage("Memory Analyzer: Loading " + jsonPath.path);
            } else {
                await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    filters: { "JSON file": ["json"] },
                }).then(uri => {
                    if (uri && uri[0]) {
                        jsonPath = uri[0];
                    } else {
                        return false;
                    }
                });
            }
            var rawData = await vscode.workspace.fs.readFile(jsonPath);
            this.loadedJSON = await JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Memory Analyzer: Could not read JSON data");
            return false;
        }

        this.loadedJSON = createAllocationJSON(this.loadedJSON);
        if (!this.loadedJSON) {
            vscode.window.showErrorMessage("JSON file has unexpected format");
            return false;
        }
        return true;
    }

    public getAllocationJSON(): AllocationJSON | undefined {
        return this.loadedJSON;
    }

    public async loadProject(): Promise<boolean> {
        // Clear previous data
        this.classFileMap.clear();

        // No workspace
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage("No workspace is open");
            return false;
        }

        // No files found
        let files: vscode.Uri[] = await vscode.workspace.findFiles("**/*.java");
        if (files.length === 0) {
            vscode.window.showErrorMessage("No Java files found in workspace");
            return false;
        }

        // Check if LSP is active
        var LSP = vscode.extensions.getExtension(Constants.LSP_EXTENSION);
        if (!LSP) {
            vscode.window.showErrorMessage("Language support for Java is not present");
            return false;
        }
        if (!LSP.isActive) {
            vscode.window.showErrorMessage("Language support for Java is not ready yet, try again later");
            return false;
        }

        // Find every declaration of class and method
        for (let file of files) {
            let document = await vscode.workspace.openTextDocument(file);
            let symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', file);

            // File has no symbols, ignore
            if (!symbols) {
                continue;
            }

            // Can be only one package
            let filePackage: string = "";

            // Can be multiple classes
            let fileClasses: { name: string, range: vscode.Range, declared: number, methods: { name: string, range: vscode.Range, declared: number }[], constructors: { name: string, range: vscode.Range, declared: number }[] }[] = [];

            for (let symbol of symbols) {
                // Symbol is a class
                if (symbol.kind === vscode.SymbolKind.Class) {
                    var className = symbol.name;
                    var classRange = symbol.range;
                    var classDeclared = this.findDeclarationLine(symbol, document, "class\\s+" + symbol.name);

                    // Find every method of the class
                    let classConstructors: { name: string, range: vscode.Range, declared: number }[] = [];
                    let classMethods: { name: string, range: vscode.Range, declared: number }[] = [];
                    for (let child of symbol.children) {
                        // Found constructor
                        if (child.kind === vscode.SymbolKind.Constructor) {
                            var childDeclared = this.findDeclarationLine(child, document, symbol.name + "\\s*\\(");
                            classConstructors.push({ name: child.name, range: child.range, declared: childDeclared });
                        }

                        // Found method
                        if (child.kind === vscode.SymbolKind.Method) {
                            var rawName = child.name.substring(0, child.name.indexOf("("));
                            var childDeclared = this.findDeclarationLine(child, document, rawName + "\\s*\\(");
                            classMethods.push({ name: child.name, range: child.range, declared: childDeclared });
                        }
                    }
                    fileClasses.push({ name: className, range: classRange, declared: classDeclared, methods: classMethods, constructors: classConstructors });
                }

                // Symbol is a package
                if (symbol.kind === vscode.SymbolKind.Package) {
                    filePackage = symbol.name;
                }
            }

            fileClasses.forEach(c => {
                if (!filePackage) {
                    this.classFileMap.set(c.name, new ClassRecord(file.path, filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                } else {
                    this.classFileMap.set(filePackage + "." + c.name, new ClassRecord(file.path, filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                }
            });
        }

        if (this.classFileMap.size === 0) {
            vscode.window.showErrorMessage("Could not find any Java symbols");
            return false;
        }

        return true;
    }

    // Key = package.class
    // Value = class data
    public getFileMap(): Map<string, ClassRecord> {
        return this.classFileMap;
    }

    private findDeclarationLine(symbol: vscode.DocumentSymbol, document: vscode.TextDocument, expression: string): number {
        let regex = new RegExp(expression);
        for (let line = symbol.range.start.line; line <= symbol.range.end.line; line++) {
            if (regex.test(document.lineAt(line).text)) {
                return line;
            }
        }
        return symbol.range.start.line;
    }
}