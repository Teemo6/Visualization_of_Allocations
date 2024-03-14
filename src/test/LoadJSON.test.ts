import * as assert from 'assert';
import * as vscode from 'vscode';

import path from 'path';
import fs from 'fs';

import * as json from '../load/AllocationJSON';

suite("AllocationJSON detection", () => {
    const validPath = path.join(__dirname, "../", "../", "src", "test", "LoadJSON_data", "valid");
    fs.readdirSync(validPath).forEach(file => {
        if (file.endsWith(".json")) {
            const filePath = path.join(validPath, file);
            test("Valid test: " + file, async () => {
                const dataUri = vscode.Uri.file(filePath);
                const rawData = await vscode.workspace.fs.readFile(dataUri);
                const jsonData = JSON.parse(rawData.toString());

                assert.equal(true, (json.createAllocationJSON(jsonData) !== undefined));
            });
        }
    });

    const invalidPath = path.join(__dirname, "../", "../", "src", "test", "LoadJSON_data", "invalid");
    fs.readdirSync(invalidPath).forEach(file => {
        if (file.endsWith(".json")) {
            const filePath = path.join(invalidPath, file);
            test("Invalid test: " + file, async () => {
                const dataUri = vscode.Uri.file(filePath);
                const rawData = await vscode.workspace.fs.readFile(dataUri);
                const jsonData = JSON.parse(rawData.toString());

                assert.equal(false, (json.createAllocationJSON(jsonData) !== undefined));
            });
        }
    });
});
