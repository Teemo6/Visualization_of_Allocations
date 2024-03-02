window.addEventListener("message", e => {
    let message = e.data;
    if (message.type === "data") {
        // Overwrite alloc header text
        var header = document.getElementById("alloc-header");
        header.innerText = "Allocations at line " + message.line;

        // Fill allocation table
        var allocData = message.allocData;
        var allocTable = document.getElementById("alloc-table");
        allocTable.innerHTML = "";

        allocData.forEach(alloc => {
            var row = document.createElement("tr");
            row.innerHTML = `
                <td>${alloc.name}</td>
                <td>${alloc.size}</td>
                <td>${alloc.count}</td>
            `;
            allocTable.appendChild(row);
        });

        // Overwrite duplicate header text
        var header = document.getElementById("dupe-header");
        header.innerText = "Duplicat at line " + message.line;
        
        // Fill duplicate table
        var dupeData = message.dupeData;
        var dupeTable = document.getElementById("dupe-table");
        dupeTable.innerHTML = "";

        dupeData.forEach(dupe => {
            var row = document.createElement("tr");
            row.innerHTML = `
                <td>${dupe.name}</td>
                <td>${dupe.size}</td>
                <td>${dupe.count}</td>
                <td>${dupe.source}</td>
            `;
            dupeTable.appendChild(row);
        });
    }
});
;