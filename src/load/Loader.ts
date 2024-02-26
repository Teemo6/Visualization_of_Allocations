import * as vscode from 'vscode';

import { ClassRecord } from '../model/ClassRecord';

export class Loader {
    // Key = package.class
    // Value = class data
    private classFileMap: Map<string, ClassRecord> = new Map();

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
                            console.log("Constructor " + child.name + " declared at " + childDeclared);
                        }

                        // Found method
                        if (child.kind === vscode.SymbolKind.Method) {
                            var rawName = child.name.substring(0, child.name.indexOf("("));
                            var childDeclared = this.findDeclarationLine(child, document, rawName + "\\s*\\(");
                            classMethods.push({ name: child.name, range: child.range, declared: childDeclared });
                            console.log("Method " + child.name + " declared at " + childDeclared);
                        }
                    }
                    fileClasses.push({ name: className, range: classRange, declared: classDeclared, methods: classMethods, constructors: classConstructors });
                    console.log("Class " + className + " declared at " + classDeclared);
                }

                // Symbol is a package
                if (symbol.kind === vscode.SymbolKind.Package) {
                    filePackage = symbol.name;
                }
            }

            fileClasses.forEach(c => {
                if (!filePackage) {
                    this.classFileMap.set(c.name, new ClassRecord(file, filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                } else {
                    this.classFileMap.set(filePackage + "." + c.name, new ClassRecord(file, filePackage, c.name, c.range, c.declared, c.methods, c.constructors));
                }
            });
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