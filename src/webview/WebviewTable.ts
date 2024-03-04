import * as vscode from 'vscode';

export class WebviewTable {
    public panel: vscode.WebviewPanel | undefined;
    public extensionUri: vscode.Uri | undefined;

    public createNewPanel(context: vscode.ExtensionContext): void {
        this.extensionUri = context.extensionUri;
        this.panel = vscode.window.createWebviewPanel("analyzerView", "Memory Analyzer", vscode.ViewColumn.Two, {
            enableScripts: true,
            localResourceRoots: [context.extensionUri]
        });
        this.panel.onDidDispose(() => this.panel = undefined);
        this.panel.webview.html = this.getHTML();

        this.panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === "goto") {
                    vscode.window.showInformationMessage(message.text);
                    return;
                }
            },
            undefined,
            context.subscriptions
        );
    }

    public hasActivePanel() {
        return this.panel !== undefined;
    }

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