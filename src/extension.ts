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

    // Start / stop showing allocation data
    const toggleShowing = vscode.commands.registerCommand('java-memory-analyzer.toggleShowing', manager.toggleShowingData.bind(manager));

    // Event actions
    // Load highlight on editor activation
    const highlightLines = vscode.window.onDidChangeVisibleTextEditors(manager.highlightEditors.bind(manager));

    // Reload highlight on configuration change
    const relaodHighlights = vscode.workspace.onDidChangeConfiguration(manager.reloadHighlights.bind(manager));

    // Command actions
    context.subscriptions.push(loadFile);
    context.subscriptions.push(showDetail);
    context.subscriptions.push(toggleShowing);

    // Event actions
    context.subscriptions.push(highlightLines);
    context.subscriptions.push(relaodHighlights);
}