import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { walkDirectory, EXCLUDED_DIRECTORIES, SUPPORTED_EXTENSIONS } from '../src/walker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.resolve(__dirname, 'fixtures', 'sample-project');

describe('Directory Walker', () => {
  beforeAll(async () => {
    // Ensure fixture directories and dummy files exist, including those ignored by git
    const dummyExcludedFiles = [
      path.join(fixtureDir, 'node_modules', 'fake-pkg', 'index.js'),
      path.join(fixtureDir, '.git', 'hooks', 'dummy.js'),
      path.join(fixtureDir, 'dist', 'bundle.js'),
      path.join(fixtureDir, '__pycache__', 'cached.py'),
    ];

    for (const filePath of dummyExcludedFiles) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, '// dummy excluded file content', 'utf8');
    }
  });

  it('correctly discovers only supported files and excludes ignored directories', async () => {
    const files = await walkDirectory(fixtureDir);

    // Normalize path separators to forward slashes for cross-platform test assertions
    const normalizedFiles = files.map((f) => f.replace(/\\/g, '/')).sort();

    const expectedFiles = [
      'components/Button.tsx',
      'scripts/helper.py',
      'src/app.ts',
      'src/utils.js',
    ].sort();

    expect(normalizedFiles).toEqual(expectedFiles);
  });

  it('excludes common irrelevant directories like node_modules, .git, and dist', async () => {
    const files = await walkDirectory(fixtureDir);
    const normalizedFiles = files.map((f) => f.replace(/\\/g, '/'));

    for (const file of normalizedFiles) {
      for (const excludedDir of EXCLUDED_DIRECTORIES) {
        expect(file.startsWith(`${excludedDir}/`)).toBe(false);
      }
    }
  });

  it('only returns files with supported source code extensions', async () => {
    const files = await walkDirectory(fixtureDir);

    for (const file of files) {
      const ext = path.extname(file);
      expect(SUPPORTED_EXTENSIONS.has(ext)).toBe(true);
    }
  });
});
