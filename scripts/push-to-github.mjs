import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();
const remoteUrl = 'https://github.com/emirhan00zcan-debug/E-commerce.git';

async function deploy() {
    try {
        // 1. Initialize repo if not exist
        if (!fs.existsSync(path.join(dir, '.git'))) {
            console.log('Initializing git repository...');
            await git.init({ fs, dir, defaultBranch: 'main' });
        }

        // 2. Add files (filtering by statusMatrix which respects .gitignore)
        console.log('Adding files...');
        const matrix = await git.statusMatrix({ fs, dir });
        for (const [filepath, head, workdir, stage] of matrix) {
            if (workdir !== head) {
                await git.add({ fs, dir, filepath });
            }
        }

        // 3. Commit
        console.log('Committing...');
        const sha = await git.commit({
            fs,
            dir,
            author: {
                name: 'Antigravity AI',
                email: 'antigravity@example.com',
            },
            message: 'Initial deployment via Antigravity AI'
        });
        console.log(`Committed with SHA: ${sha}`);

        // Ensure we are on main
        try {
            await git.branch({ fs, dir, ref: 'main', checkout: true });
        } catch (e) {
            // If branch already exists or other error, ignore for now
        }

        // 4. Push
        console.log('Pushing to GitHub...');
        // We will need a token here. I'll ask the user to provide it via env var.
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GITHUB_TOKEN environment variable is not set.');
        }

        await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            ref: 'main',
            url: remoteUrl,
            force: true,
            onAuth: (url) => {
                console.log(`Authenticating for: ${url}`);
                return {
                    username: token,
                    password: ''
                };
            }
        });

        console.log('Deployment successful!');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

deploy();
