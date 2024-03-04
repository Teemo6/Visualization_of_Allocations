import * as vscode from 'vscode';
import path from 'path';

/**
 * Constants used all around the extension
 */
export class Constants {
    /**
     * Load user color settings
     */
    public static COLOR_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.color");
    /**
     * Load user json settings
     */
    public static JSON_CONFIG = vscode.workspace.getConfiguration("java-memory-analyzer.json");
    /**
     * LSP extension provider
     */
    public static LSP_EXTENSION: string = "redhat.java";
    /**
     * How does Java Analyzer name constructor
     */
    public static LINE_CONSTRUCTOR_STRING: string = "<init>";
    /**
     * Locale
     */
    public static NUMBER_LOCALE: string = "cs-CZ";
    /**
     * Delimiter of webview duplicate trace
     */
    public static DUPLICATE_DETAIL_DELI: string = ":";

    // Default gutter path
    public static LINE_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "line_allocation.svg"));
    public static METHOD_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "method_allocation.svg"));
    public static CLASS_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, 'icons', 'class_allocation.svg'));
    public static NO_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "no_allocation.svg"));
}