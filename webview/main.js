/* eslint-disable no-undef */
/**
 * Add event listener to receieve message and listener for duplicate source click
 */
(function () {
    const vscode = acquireVsCodeApi();

    window.addEventListener("message", e => {
        const message = e.data;

        // No allocation data 
        if (message.type === "noData") {
            document.getElementById("alloc").innerHTML = "<h3>No allocation data for line " + message.line + "</h3>";
            document.getElementById("dupe").innerHTML = "";
        }

        // Got message with data
        if (message.type === "data") {
            // Fill allocation table
            let allocTable = `
                <h3>Allocations at line ${message.line}</h3>
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Size&nbsp;[B]</th>
                            <th>Count</th>
                        </tr>`;

            message.allocData.forEach(alloc => {
                allocTable += `
                        <tr>
                            <td>${alloc.name}</td>
                            <td>${alloc.size}</td>
                            <td>${alloc.count}</td>
                        </tr>`;
            });
            allocTable += "</table>";
            document.getElementById("alloc").innerHTML = allocTable;

            // Fill duplicate table
            let dupeTable = `
                <h3>Duplicates at line ${message.line}</h3>
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Size&nbsp;[B]</th>
                            <th>Count</th>
                            <th>Source</th>
                        </tr>`;

            let id = 0;
            let idMap = new Map();
            message.dupeData.forEach(dupe => {
                idMap.set(id.toString(), dupe.source);
                dupeTable += `
                        <tr>
                            <td>${dupe.name}</td>
                            <td>${dupe.size}</td>
                            <td>${dupe.count}</td>
                            <td><a id="${id}">${dupe.source}</a></td>
                        </tr>`;
                id++;
            });
            // eslint-disable-next-line no-undef
            document.getElementById("dupe").innerHTML = dupeTable;

            // Register reference clicked
            idMap.forEach((source, id) => document.getElementById(id).addEventListener("click", function () {
                vscode.postMessage({
                    command: "goto",
                    text: source
                });
            }));
        }
    });
}());