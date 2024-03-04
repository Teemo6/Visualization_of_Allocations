import * as assert from 'assert';
import * as vscode from 'vscode';
import path from 'path';

import * as json from '../load/AllocationJSON';

// TODO: Update with new JSON files
suite('Allocation JSON', () => {
    vscode.window.showInformationMessage('Running JSON file loading tests');

    test('Valid regular JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'valid_regular.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(true, json.createAllocationJSON(jsonData));
    });

    test('Valid empty JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'valid_empty.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(true, json.createAllocationJSON(jsonData));
    });

    test('Invalid key JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_key.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid value JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_value.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid missing line JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_line.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid missing method JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_method.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid missing class JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_class.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid missing duplicate JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_duplicate.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });

    test('Invalid JSON', async () => {
        let jsonData;
        try {
            const dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_json.json'));
            const rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.createAllocationJSON(jsonData));
    });
});
