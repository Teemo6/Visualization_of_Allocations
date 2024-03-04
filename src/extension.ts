import * as vscode from 'vscode';

import { ExtensionManager } from './ExtensionManager';

/**
 * Function that activates Memory Analyzer extension, called when first user request is made
 * @param context context passed from VSCode
 */
export function activate(context: vscode.ExtensionContext): void {
    // Persistent object
    const manager: ExtensionManager = new ExtensionManager(context);

    // Command actions
    // Only load JSON file
    const loadFile = vscode.commands.registerCommand('java-memory-analyzer.loadFile', manager.loadFile.bind(manager));

    // Only load JSON file
    const showDetail = vscode.commands.registerCommand('java-memory-analyzer.showDetail', manager.showDetail.bind(manager));

    // Stop showing allocation data
    const stopShowing = vscode.commands.registerCommand('java-memory-analyzer.stopShowing', manager.stopShowingData.bind(manager));

    // Start showing allocation data
    const startShowing = vscode.commands.registerCommand('java-memory-analyzer.startShowing', manager.startShowingData.bind(manager));

    // Event actions
    // Load highlight on editor activation
    const highlightLines = vscode.window.onDidChangeVisibleTextEditors(manager.highlightEditors.bind(manager));

    // Command actions
    context.subscriptions.push(loadFile);
    context.subscriptions.push(showDetail);
    context.subscriptions.push(stopShowing);
    context.subscriptions.push(startShowing);

    // Event actions
    context.subscriptions.push(highlightLines);
}