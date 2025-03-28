import * as path from "path";

/**
 * Constants used all around the extension
 */
export class Constants {
    /**
     * User color settings
     */
    public static CONFIG_COLOR = "java-memory-analyzer.color";
    /**
     * User json settings
     */
    public static CONFIG_JSON = "java-memory-analyzer.json";
    /**
     * User details settings
     */
    public static CONFIG_DETAILS = "java-memory-analyzer.details";
    /**
     * Highlight font style
     */
    public static CONFIG_FONT = "java-memory-analyzer.highlightFont";
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

    // Gutter icons => SCRAPPED because custom color config
    // public static LINE_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "line_allocation.svg"));
    // public static METHOD_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "method_allocation.svg"));
    // public static CLASS_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, 'icons', 'class_allocation.svg'));
    // public static NO_ALLOCATION_GUTTER: vscode.Uri = vscode.Uri.file(path.join(__dirname, "icons", "no_allocation.svg"));

    /**
     * For some reason editor.document.uri.path sometimes returns C: or c: on Windows, it is a known URI bug https://github.com/microsoft/vscode/issues/138397
     * @param p file path
     * @returns normalized windows file path with small disc letter
     */
    public static normalizeWindowsPath(p: string): string {
        let normalizedPath = path.normalize(p);
        if (normalizedPath.indexOf(":") !== 0) {
            normalizedPath = normalizedPath.substring(0, normalizedPath.indexOf(":")).toLowerCase()
                + normalizedPath.substring(normalizedPath.indexOf(":"), normalizedPath.length);
        }
        return normalizedPath;
    }
}