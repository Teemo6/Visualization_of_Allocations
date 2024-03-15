import * as vscode from 'vscode';
import path from 'path';

import { ClassRecord } from '../model/lsp/ClassRecord';
import { AllocationJSON, createAllocationJSON } from './AllocationJSON';
import { Constants } from '../Constants';

/**
 * Handle JSON file loading and Java symbols loading
 */
export class Loader {
    /**
     * Loaded file data
     */
    private loadedJSON: AllocationJSON | undefined = undefined;
    /**
     *  Map<"package.class", Java symbols in class>
     */
    private classFileMap: Map<string, ClassRecord> = new Map();

    /**
     * Load specified JSON data from file accorting to user settings, if no path is provided, open file dialog
     * @returns JSON file was successfully/unsucessfully parsed
     */
    public async loadJSONFile(): Promise<boolean> {
        // Reset local data
        this.loadedJSON = undefined;
        let jsonPath: vscode.Uri = vscode.Uri.file("");

        try {
            // Load file according to settings or open file dialog 
            const userDefined = vscode.workspace.getConfiguration(Constants.CONFIG_JSON).get<string>("defaultPath");
            if (userDefined) {
                jsonPath = vscode.Uri.parse("file:/" + userDefined);
                vscode.window.setStatusBarMessage("Reading data from " + path.basename(jsonPath.path));
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
            const rawData = await vscode.workspace.fs.readFile(jsonPath);
            this.loadedJSON = await JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Memory Analyzer: Could not read JSON data");
            return false;
        }

        // Check if loaded data have specified format
        this.loadedJSON = createAllocationJSON(this.loadedJSON);
        if (!this.loadedJSON) {
            vscode.window.showErrorMessage("JSON file has unexpected format");
            return false;
        }

        // Ask to save JSON path in workspace settings
        if (vscode.workspace.getConfiguration(Constants.CONFIG_JSON).get<boolean>("askToSavePath")) {
            vscode.window.showInformationMessage(
                "Do you want to set " + path.basename(jsonPath.path) + " as default JSON path for this workspace?",
                "Yes",
                "No",
                "Don't ask again"
            ).then(answer => {
                if (answer === "Yes") {
                    vscode.workspace.getConfiguration(Constants.CONFIG_JSON).update("defaultPath", jsonPath.fsPath, vscode.ConfigurationTarget.Workspace);
                    vscode.workspace.getConfiguration(Constants.CONFIG_JSON).update("askToSavePath", false, vscode.ConfigurationTarget.Workspace);
                } else if (answer === "Don't ask again") {
                    vscode.workspace.getConfiguration(Constants.CONFIG_JSON).update("askToSavePath", false, vscode.ConfigurationTarget.Workspace);
                }
            });
        }
        return true;
    }

    /**
     * @returns loaded JSON data from file, undefined if no data are present
     */
    public getAllocationJSON(): AllocationJSON | undefined {
        return this.loadedJSON;
    }

    /**
     * Load Java symbols from LSP (Language Service Provider) extension in current workspace
     * @returns Java symols have been successfully/unsucessfully loaded
     */
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
        if (!LSP.isActive) {
            vscode.window.showErrorMessage("Language support for Java is not ready yet, try again later");
            return false;
        }

        // Find every declaration of class and method
        for (const file of files) {
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
                    this.classFileMap.set(c.name, new ClassRecord(path.normalize(file.path), filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                } else {
                    this.classFileMap.set(filePackage + "." + c.name, new ClassRecord(path.normalize(file.path), filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                }
            });
        }

        // No symbols found
        if (this.classFileMap.size === 0) {
            vscode.window.showErrorMessage("Could not find any Java symbols");
            return false;
        }

        // Check if files contain some symbols
        const noSymbols: string[] = [];
        files.forEach(f => {
            let found = false;
            for (const val of this.classFileMap.values()) {
                if (path.normalize(f.path) === val.file) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                noSymbols.push(f.path);
                console.warn("Found no symbols in file " + f.path);
            }
        });

        // Let user know if some files are missing Java symbols
        if (noSymbols.length !== 0) {
            let which: string = "";
            noSymbols.forEach(s => {
                which += path.basename(s) + ", ";
            });
            which = which.substring(0, which.length - 2);
            vscode.window.showWarningMessage("Found no Java symbols in files: " + which);
        }
        return true;
    }

    /**
     * @returns Map<"package.class", Java symbols in class>
     */
    public getFileMap(): Map<string, ClassRecord> {
        return this.classFileMap;
    }

    /**
     * Find at which line inside Java symbol is expression 
     * (used for class/method declaration line symbol.range.start.line does not always show correct declaration line)
     * @param symbol Java symbol
     * @param document Document which contains symbol
     * @param expression Expression to find
     * @returns Declaration line indexed from 0, symbol.range.start.line if expression is not found
     */
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