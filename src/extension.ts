import * as vscode from 'vscode';

import { ExtensionManager } from './ExtensionManager';

export function activate(context: vscode.ExtensionContext): void {
    // Persistent object
    const manager: ExtensionManager = new ExtensionManager(context);

    // Command actions
    // Run Memory Analyzer and load JSON file
    const runAnalyzer = vscode.commands.registerCommand('java-memory-analyzer.runAnalyzer', manager.runAnalyzer.bind(manager));

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

    // Update highlight colors upon editing configuration
    const updateConfig = vscode.workspace.onDidChangeConfiguration(manager.updateConfig.bind(manager));

    // Command actions
    context.subscriptions.push(runAnalyzer);
    context.subscriptions.push(loadFile);
    context.subscriptions.push(showDetail);
    context.subscriptions.push(stopShowing);
    context.subscriptions.push(startShowing);

    // Event actions
    context.subscriptions.push(highlightLines);
    context.subscriptions.push(updateConfig);
}