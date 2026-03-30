const fs = require('fs');

async function run() {
    try {
        const queryUrl = "https://api.supabase.com/v1/projects/ywaeagmkrvonphodzkzv/database/query";
        const headers = {
            "Authorization": "Bearer sbp_1b81dbb54607acb6a4ee2401e37d93d21944a871",
            "Content-Type": "application/json"
        };

        const sql = fs.readFileSync('frankfurt_schema.sql', 'utf8');
        // Split by statement endings.
        // A bit hacky but for our generated schema `\n;\n` or similar isn't perfect since DO $$ has `;`.
        // Actually, our generated schema has exactly one statement per line or block ending with `END $$;\n` or `);` or `SECURITY;\n`
        const statements = sql.split(/;\n(?=C|A|D)/); // Split safely based on our generation format

        console.log("Total statements to run:", statements.length);

        for (let i = 0; i < statements.length; i++) {
            let stmt = statements[i].trim();
            if (!stmt) continue;
            if (!stmt.endsWith(';')) stmt += ';';

            const res = await fetch(queryUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({ query: stmt })
            });
            const text = await res.text();
            if (res.status >= 400) {
                console.error(`Statement ${i + 1} failed:`);
                console.error(`Query: ${stmt.substring(0, 100)}...`);
                console.error(`Error: ${text}`);
            }
        }
        console.log("All statements executed successfully!");
    } catch (e) {
        console.error(e);
    }
}
run();
