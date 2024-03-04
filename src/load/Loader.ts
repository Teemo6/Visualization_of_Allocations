import * as vscode from 'vscode';

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
            const userDefined = Constants.JSON_CONFIG.get<string>("defaultPath");
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
                if (Constants.JSON_CONFIG.get<boolean>("askToSavePath")) {
                    vscode.window.showInformationMessage(
                        "Do you want to set " + jsonPath.path + " as default JSON path for this workspace?",
                        "Yes",
                        "No",
                        "Don't ask again"
                    ).then(answer => {
                        if (answer === "Yes") {
                            Constants.JSON_CONFIG.update("defaultPath", jsonPath.fsPath, vscode.ConfigurationTarget.Workspace);
                        } else if (answer === "Don't ask again") {
                            Constants.JSON_CONFIG.update("askToSavePath", false, vscode.ConfigurationTarget.Workspace);
                        }
                    });
                }
            }
            const rawData = await vscode.workspace.fs.readFile(jsonPath);
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
        const files: vscode.Uri[] = await vscode.workspace.findFiles("**/*.java");
        if (files.length === 0) {
            vscode.window.showErrorMessage("No Java files found in workspace");
            return false;
        }

        // Check if LSP is present and active
        const LSP = vscode.extensions.getExtension(Constants.LSP_EXTENSION);
        if (!LSP) {
            vscode.window.showErrorMessage("Language support for Java is not present");
            return false;
        }
        await LSP.activate();
        if (!LSP.isActive) {
            vscode.window.showErrorMessage("Language support for Java is not ready yet, try again later");
            return false;
        }

        // Find every declaration of class and method
        for (const file of files) {
            console.log(file.path);
            const document = await vscode.workspace.openTextDocument(file);
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', file);

            // File has no symbols, ignore
            if (!symbols) {
                continue;
            }

            // Can be only one package
            let filePackage: string = "";

            // Can be multiple classes
            const fileClasses: { name: string, range: vscode.Range, declared: number, methods: { name: string, range: vscode.Range, declared: number }[], constructors: { name: string, range: vscode.Range, declared: number }[] }[] = [];

            for (const symbol of symbols) {
                // Symbol is a class
                if (symbol.kind === vscode.SymbolKind.Class) {
                    const className = symbol.name;
                    const classRange = symbol.range;
                    const classDeclared = this.findDeclarationLine(symbol, document, "class\\s+" + symbol.name);

                    // Find every method of the class
                    const classConstructors: { name: string, range: vscode.Range, declared: number }[] = [];
                    const classMethods: { name: string, range: vscode.Range, declared: number }[] = [];
                    for (const child of symbol.children) {
                        // Found constructor
                        if (child.kind === vscode.SymbolKind.Constructor) {
                            const childDeclared = this.findDeclarationLine(child, document, symbol.name + "\\s*\\(");
                            classConstructors.push({ name: child.name, range: child.range, declared: childDeclared });
                        }

                        // Found method
                        if (child.kind === vscode.SymbolKind.Method) {
                            const rawName = child.name.substring(0, child.name.indexOf("("));
                            const childDeclared = this.findDeclarationLine(child, document, rawName + "\\s*\\(");
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
        const regex = new RegExp(expression);
        for (let line = symbol.range.start.line; line <= symbol.range.end.line; line++) {
            if (regex.test(document.lineAt(line).text)) {
                return line;
            }
        }
        return symbol.range.start.line;
    }
}