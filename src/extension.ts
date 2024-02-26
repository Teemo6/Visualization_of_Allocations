import * as vscode from 'vscode';

import { ExtensionManager } from './ExtensionManager';

export function activate(context: vscode.ExtensionContext): void {
    console.log("Plugin activated");

    // Persistent object
    const manager: ExtensionManager = new ExtensionManager();

    // Command actions

    // Run Memory Analyzer and load JSON file
    let runAnalyzer = vscode.commands.registerCommand('java-memory-analyzer.runAnalyzer', manager.loadFile.bind(manager));

    // Only load JSON file
    let loadFile = vscode.commands.registerCommand('java-memory-analyzer.loadFile', manager.loadFile.bind(manager));

    // Stop showing allocation data
    let stopShowing = vscode.commands.registerCommand('java-memory-analyzer.stopShowing', manager.stopShowingData.bind(manager));

    // Start showing allocation data
    let startShowing = vscode.commands.registerCommand('java-memory-analyzer.startShowing', manager.startShowingData.bind(manager));

    // Event actions
    // Load highlight on editor activation
    let highlightLines = vscode.window.onDidChangeVisibleTextEditors(manager.highlightEditors.bind(manager));

    // Command actions
    context.subscriptions.push(runAnalyzer);
    context.subscriptions.push(loadFile);
    context.subscriptions.push(stopShowing);
    context.subscriptions.push(startShowing);

    // Event actions
    context.subscriptions.push(highlightLines);
}