const fs = require('fs');

const tablesData = JSON.parse(fs.readFileSync('C:/Users/pc/.gemini/antigravity/brain/cf8f9ee9-30ed-4700-8872-fed342ec936b/.system_generated/steps/391/output.txt', 'utf8'));
const policiesRaw = JSON.parse(fs.readFileSync('C:/Users/pc/.gemini/antigravity/brain/cf8f9ee9-30ed-4700-8872-fed342ec936b/.system_generated/steps/507/output.txt', 'utf8'));
const policiesJson = JSON.parse(policiesRaw.result.match(/<untrusted-data[^>]*>\n([\s\S]*?)\n<\/untrusted-data/)[1]);

let sql = '';

const enums = new Map();
tablesData.tables.forEach(t => {
    t.columns.forEach(c => {
        if (c.enums) {
            enums.set(c.format, c.enums);
        }
    });
});
enums.forEach((vals, name) => {
    sql += `DO $$ BEGIN CREATE TYPE public.${name} AS ENUM (${vals.map(v => `'${v}'`).join(', ')}); EXCEPTION WHEN duplicate_object THEN null; END $$;\n`;
});

const functionsRaw = JSON.parse(fs.readFileSync('C:/Users/pc/.gemini/antigravity/brain/cf8f9ee9-30ed-4700-8872-fed342ec936b/.system_generated/steps/696/output.txt', 'utf8'));
const functionsJson = JSON.parse(functionsRaw.result.match(/<untrusted-data[^>]*>\n([\s\S]*?)\n<\/untrusted-data/)[1]);
functionsJson.forEach(f => {
    sql += f.pg_get_functiondef + ';\n';
});

tablesData.tables.forEach(t => {
    sql += `\nCREATE TABLE IF NOT EXISTS ${t.name} (\n`;
    let cols = t.columns.map(c => {
        let def = `  "${c.name}" ${c.data_type === 'USER-DEFINED' ? 'public.' + c.format : c.data_type}`;
        if (!c.options.includes('nullable')) def += ' NOT NULL';
        if (c.default_value) {
            if (c.options.includes('generated')) {
                def += ` GENERATED ALWAYS AS ${c.default_value} STORED`;
            } else {
                def += ` DEFAULT ${c.default_value}`;
            }
        }
        if (c.options.includes('unique')) def += ' UNIQUE';
        if (c.check) def += ` CHECK (${c.check})`;
        return def;
    });
    if (t.primary_keys && t.primary_keys.length > 0) {
        cols.push(`  PRIMARY KEY (${t.primary_keys.map(k => `"${k}"`).join(', ')})`);
    }
    sql += cols.join(',\n') + `\n);\n`;

    if (t.rls_enabled) {
        sql += `ALTER TABLE ${t.name} ENABLE ROW LEVEL SECURITY;\n`;
    }
});

tablesData.tables.forEach(t => {
    if (t.foreign_key_constraints) {
        t.foreign_key_constraints.forEach(fk => {
            const srcTable = fk.source.split('.').slice(0, 2).join('.');
            const srcCols = [fk.source.split('.').pop()];
            const tgtTable = fk.target.split('.').slice(0, 2).join('.');
            const tgtCols = [fk.target.split('.').pop()];
            sql += `DO $$ BEGIN ALTER TABLE ${srcTable} ADD CONSTRAINT ${fk.name} FOREIGN KEY ("${srcCols[0]}") REFERENCES ${tgtTable} ("${tgtCols[0]}"); EXCEPTION WHEN duplicate_object THEN null; END $$;\n`;
        });
    }
});

policiesJson.forEach(p => {
    const safeName = p.policyname.replace(/"/g, '""');
    let pol = `DO $$ BEGIN CREATE POLICY "${safeName}" ON ${p.schemaname}.${p.tablename} FOR ${p.cmd} TO ${p.roles.replace(/[{}]/g, '')}`;
    if (p.qual) pol += ` USING (${p.qual})`;
    if (p.with_check) pol += ` WITH CHECK (${p.with_check})`;
    sql += pol + `; EXCEPTION WHEN duplicate_object THEN null; END $$;\n`;
});

fs.writeFileSync('c:/Users/pc/OneDrive/Masaüstü/Ecommerce/homesync/frankfurt_schema.sql', sql);
console.log('Done generating frankfurt_schema.sql');
