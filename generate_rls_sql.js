const fs = require('fs');

const rawData = fs.readFileSync('C:/Users/pc/.gemini/antigravity/brain/6e38d2be-4d0e-4c1d-9b97-8d7bd3e247f0/.system_generated/steps/133/output.txt', 'utf8');
const data = JSON.parse(rawData);

// Extract the actual JSON array from the result string
const resultStr = data.result;
const match = resultStr.match(/<untrusted-data-[^>]+>\n(.*)\n<\/untrusted-data-/s);
if (!match) {
    console.error('Could not find untrusted data boundary');
    process.exit(1);
}

const policies = JSON.parse(match[1]);

let queries = [];
let updateCount = 0;

policies.forEach(policy => {
    let modifiedQual = policy.qual;
    let modifiedWithCheck = policy.with_check;
    let changed = false;

    const replaceAuth = (str) => {
        if (!str) return str;
        // Replace auth.uid() or auth.jwt() with (select auth.uid()) but avoid double-wrapping
        // Simple approach: replace all auth.uid() with (select auth.uid())
        // then fix double selects if they happen 
        let res = str;

        // Using a simple regex
        if (res.includes('auth.uid()') && !res.includes('(select auth.uid())') && !res.includes('( SELECT auth.uid()')) {
            res = res.replace(/auth\.uid\(\)/g, '(select auth.uid())');
        }
        if (res.includes('auth.jwt()') && !res.includes('(select auth.jwt())') && !res.includes('( SELECT auth.jwt()')) {
            res = res.replace(/auth\.jwt\(\)/g, '(select auth.jwt())');
        }
        if (res.includes('auth.email()') && !res.includes('(select auth.email())') && !res.includes('( SELECT auth.email()')) {
            res = res.replace(/auth\.email\(\)/g, '(select auth.email())');
        }

        return res;
    };

    const newQual = replaceAuth(modifiedQual);
    if (newQual !== modifiedQual) {
        modifiedQual = newQual;
        changed = true;
    }

    const newWithCheck = replaceAuth(modifiedWithCheck);
    if (newWithCheck !== modifiedWithCheck) {
        modifiedWithCheck = newWithCheck;
        changed = true;
    }

    if (changed) {
        // Generate DROP and CREATE statement
        queries.push(`DROP POLICY IF EXISTS "${policy.policyname}" ON "${policy.schemaname}"."${policy.tablename}";`);

        const roles = policy.roles.replace(/\{|\}/g, '').split(',').map(r => r.trim()).join(', ');

        let createStmt = `CREATE POLICY "${policy.policyname}" ON "${policy.schemaname}"."${policy.tablename}" FOR ${policy.cmd} TO ${roles}`;

        if (modifiedQual) {
            createStmt += ` USING (${modifiedQual})`;
        }
        if (modifiedWithCheck) {
            createStmt += ` WITH CHECK (${modifiedWithCheck})`;
        }
        createStmt += ';';
        queries.push(createStmt);
        updateCount++;
    }
});

fs.writeFileSync('C:/Users/pc/OneDrive/Masaüstü/Ecommerce/homesync/fix_rls.sql', queries.join('\n'));
console.log(`Generated ${updateCount} policy updates.`);
