window.addEventListener("message", e => {
    let message = e.data;
    if(message.type === "noData"){
        document.getElementById("alloc").innerHTML = "<h3>No allocation data for line " + message.line + "</h3>";
        document.getElementById("dupe").innerHTML = "";
    }

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
            
        message.dupeData.forEach(dupe => {
            dupeTable += `
            <tr>
                <td>${dupe.name}</td>
                <td>${dupe.size}</td>
                <td>${dupe.count}</td>
                <td>${dupe.source}</td>
            </tr>`;
        });
        dupeTable += "</table>";
        document.getElementById("dupe").innerHTML = dupeTable;
    }
});