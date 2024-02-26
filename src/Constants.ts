import * as vscode from 'vscode';
import path from 'path';

export class Constants {
    public static readonly LSP_EXTENSION: string = "redhat.java";

    public static readonly DEFAULT_JSON_URI: vscode.Uri = vscode.Uri.file(path.join(__dirname, "data", "data.json"));

    public static readonly LINE_CONSTRUCTOR_STRING: string = "<init>";

    public static readonly NUMBER_LOCALE: string = "cs-CZ";

    // Highlight colors
    public static readonly LINE_ALLOCATION_BACKGROUND: string = "rgba(200, 150, 0, 0.2)";
    public static readonly LINE_ALLOCATION_TEXT: string = "rgba(200, 150, 0, 0.8)";
    public static readonly LINE_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "line_allocation.svg"));

    public static readonly METHOD_ALLOCATION_BACKGROUND: string = "rgba(200, 100, 0, 0.2)";
    public static readonly METHOD_ALLOCATION_TEXT: string = "rgba(200, 100, 0, 0.8)";
    public static readonly METHOD_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "method_allocation.svg"));

    public static readonly CLASS_ALLOCATION_BACKGROUND: string = 'rgba(200, 50, 0, 0.2)';
    public static readonly CLASS_ALLOCATION_TEXT: string = 'rgba(200, 50, 0, 0.8)';
    public static readonly CLASS_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, 'icons', 'class_allocation.svg'));

    public static readonly NO_ALLOCATION_BACKGROUND: string = "rgba(150, 150, 150, 0.2)";
    public static readonly NO_ALLOCATION_TEXT: string = "rgba(150, 150, 150, 0.6)";
    public static readonly NO_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "no_allocation.svg"));
}
