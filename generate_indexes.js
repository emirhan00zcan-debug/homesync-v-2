const fs = require('fs');

async function main() {
    const data = JSON.parse(fs.readFileSync('C:/Users/pc/.gemini/antigravity/brain/6e38d2be-4d0e-4c1d-9b97-8d7bd3e247f0/.system_generated/steps/10/output.txt', 'utf8'));
    const lints = data.result.lints.filter(l => l.name === 'unindexed_foreign_keys');

    let queries = [];
    lints.forEach(lint => {
        const s = lint.metadata.schema;
        const t = lint.metadata.name;
        const fk = lint.metadata.fkey_name;
        const cols = lint.metadata.fkey_columns.join(',');

        // Postgres DO block to look up attnames dynamically and execute CREATE INDEX
        queries.push(`
DO $$
DECLARE
    col_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO col_names
    FROM pg_attribute
    WHERE attrelid = '${s}.${t}'::regclass
      AND attnum IN (${cols});
      
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_${fk}' || ' ON ${s}.${t} (' || col_names || ')';
END $$;
    `);
    });

    fs.writeFileSync('C:/Users/pc/OneDrive/Masaüstü/Ecommerce/homesync/missing_indexes.sql', queries.join('\n'));
}
main();
