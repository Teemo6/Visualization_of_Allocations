import * as vscode from 'vscode';
import path from 'path';

export class Constants {
    public static COLOR_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.color");

    public static JSON_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.json");

    public static LSP_EXTENSION: string = "redhat.java";

    public static DEFAULT_JSON_URI: vscode.Uri = vscode.Uri.file(path.join(__dirname, "data", "data.json"));

    public static LINE_CONSTRUCTOR_STRING: string = "<init>";

    public static NUMBER_LOCALE: string = "cs-CZ";

    // Default gutter path
    public static LINE_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "line_allocation.svg"));
    public static METHOD_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "method_allocation.svg"));
    public static CLASS_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, 'icons', 'class_allocation.svg'));
    public static NO_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "no_allocation.svg"));

    public static updateConfiguration() {
        Constants.COLOR_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.color");
        Constants.JSON_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.json");
    }
}