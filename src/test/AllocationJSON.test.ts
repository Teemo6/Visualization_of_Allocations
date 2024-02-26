import * as assert from 'assert';
import * as vscode from 'vscode';
import path from 'path';

import * as json from '../load/AllocationJSON';

// TODO: Update with new JSON files
suite('Allocation JSON', () => {
    vscode.window.showInformationMessage('Running JSON file loading tests');

    test('Valid regular JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'valid_regular.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(true, json.isAllocationJSON(jsonData));
    });

    test('Valid empty JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'valid_empty.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(true, json.isAllocationJSON(jsonData));
    });

    test('Invalid key JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_key.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid value JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_value.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid missing line JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_line.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid missing method JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_method.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid missing class JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_class.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid missing duplicate JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_missing_duplicate.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });

    test('Invalid JSON', async () => {
        var jsonData;
        try {
            var dataUri = vscode.Uri.file(path.join(__dirname, 'data', 'invalid_json.json'));
            var rawData = await vscode.workspace.fs.readFile(dataUri);
            jsonData = JSON.parse(rawData.toString());
        } catch (error) {
            vscode.window.showErrorMessage("Invalid JSON file");
            return;
        }

        assert.equal(false, json.isAllocationJSON(jsonData));
    });
});
