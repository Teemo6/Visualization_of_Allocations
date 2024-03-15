/* eslint-disable no-undef */

const vscode = acquireVsCodeApi();

/**
 * Get element with tableID and fill its content with table containing allocation data with interactive links
 * @param {string} tableID ID of element in HTML to fill table into
 * @param {string} tableName Header of table
 * @param {object} values Dict with each entry containing: name, size, count, source, 
 * @param {string} sourceID Prefix for interactive link
 */
function fillDivWithTable(tableID, tableName, values, sourceID) {
    let tableHTML = `
        <h3>${tableName}</h3>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Size&nbsp;[B]</th>
                    <th>Count</th>
                    <th>Source</th>
                </tr>`;

    let id = 0;
    let idMap = new Map();
    values.forEach(val => {
        idMap.set(sourceID + id.toString(), val.source);
        tableHTML += `
                <tr>
                    <td>${val.name}</td>
                    <td>${val.size}</td>
                    <td>${val.count}</td>
                    <td><a id="${sourceID}${id}">${val.source}</a></td>
                </tr>`;
        id++;
    });
    tableHTML += "</table>";
    document.getElementById(tableID).innerHTML = tableHTML;

    // Register reference clicked
    idMap.forEach((source, id) => document.getElementById(id).addEventListener("click", function () {
        vscode.postMessage({
            command: "goto",
            text: source
        });
    }));
}

/**
 * Event listener to receieve message and listener for duplicate source click
 */
window.addEventListener("message", e => {
    const message = e.data;

    // No allocation data 
    if (message.type === "noData") {
        document.getElementById("header").innerHTML = "<h3>No data for line " + message.line + "</h3>";
        document.getElementById("alloc").innerHTML = "";
        document.getElementById("dupe").innerHTML = "";
    }

    // Got message with data
    if (message.type === "data") {
        let header = "<h2>Data for ";
        if (message.kind === "class") {
            header += "class <i>" + message.name + "</i> at line " + message.line;
        } else if (message.kind === "method") {
            header += "method <i>" + message.name + "</i> at line " + message.line;
        } else if (message.kind === "line") {
            header += "line " + message.line;
        }
        header += "</h2><hr>";

        document.getElementById("header").innerHTML = header;
        fillDivWithTable("alloc", "Allocations", message.allocData, "a");

        if (message.dupeData.length !== 0) {
            fillDivWithTable("dupe", "Duplicates", message.dupeData, "d");
        } else {
            document.getElementById("dupe").innerHTML = "<h3>No duplicates found</h3>";
        }
    }
});