import * as vscode from 'vscode';
import { ExtensionManager } from '../ExtensionManager';

/**
 * Webview panel containing HTML file with allocation and duplicate tables
 */
export class WebviewTable {
    private panel: vscode.WebviewPanel | undefined;
    private extensionUri: vscode.Uri | undefined;

    /**
     * Create new panel if no other exists
     * @param manager Parent manager who will receieve data from this webview
     */
    public createNewPanel(manager: ExtensionManager): void {
        this.extensionUri = manager.context.extensionUri;
        this.panel = vscode.window.createWebviewPanel("analyzerView", "Memory Analyzer", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [manager.context.extensionUri]
        });
        this.panel.onDidDispose(() => this.panel = undefined);
        this.panel.webview.html = this.getHTML();

        // Send message from HTML to manager
        this.panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === "goto") {
                    manager.gotoLine(message.text);
                    return;
                }
            },
            undefined,
            manager.context.subscriptions
        );
    }

    /**
     * @returns if some panel exists or not
     */
    public hasActivePanel() {
        return this.panel !== undefined;
    }

    /**
     * Send only selected line to HTML and show no data 
     * @param line selected line, indexed from 1
     * @returns message has been successfully/unsuccessfully receieved
     */
    public sendNothingToTable(line: number): boolean {
        if (this.panel === undefined) {
            return false;
        }

        this.panel!.webview.postMessage({
            type: "noData",
            line: line
        });
        return true;
    }

    /**
     * Send selected line, allocation and duplicate data to HTML and show detail tables
     * @param line selected line, indexed from 1
     * @param allocData allocation information
     * @param dupeData duplicate information
     * @returns message has been successfully/unsuccessfully receieved
     */
    public sendDataToTable(line: number, allocData: { name: string, size: number, count: number }[], dupeData: { name: string, size: number, count: number, source: string }[]): boolean {
        if (this.panel === undefined) {
            return false;
        }

        this.panel!.webview.postMessage({
            type: "data",
            line: line,
            allocData: allocData,
            dupeData: dupeData
        });
        return true;
    }

    /**
     * Setup webview HTML, load script from main.js and styles from main.css
     * @returns HTML string
     */
    private getHTML(): string {
        const scriptUri = this.panel!.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri!, "src", "webview", "main.js"));
        const cssUri = this.panel!.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri!, "src", "webview", "main.css"));

        // Run only scripts secured by random nonce
        let nonce = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel!.webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Memory Analyzer</title>
                <link href="${cssUri}" rel="stylesheet">
            </head>
            <body>
                <div id="alloc"></div>
                <div id="dupe"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}