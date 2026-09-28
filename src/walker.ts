import fs from 'node:fs/promises';
import path from 'node:path';

// Supported file extensions for static analysis (JavaScript, TypeScript, and Python source files)
export const SUPPORTED_EXTENSIONS = new Set<string>([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
]);

/**
 * Directories that should be excluded from recursive traversal.
 *
 * Rationale for exclusions:
 * - 'node_modules', 'venv', '.venv': Third-party dependencies and virtual environments.
 *   Scanning these would flood results with external library code rather than user source code.
 * - '.git': Internal version control metadata and blobs, not application source.
 * - 'dist', 'build', '.next': Compiled build outputs, bundles, and cached frameworks artifacts.
 *   Analyzing generated artifacts leads to false positives and redundant warnings.
 * - '__pycache__': Compiled Python bytecode files (*.pyc), not human-written code.
 */
export const EXCLUDED_DIRECTORIES = new Set<string>([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  'venv',
  '.venv',
]);

/**
 * Recursively walks a directory and returns relative paths of all files matching supported extensions,
 * ignoring common non-source directories (e.g. node_modules, dist, .git).
 *
 * @param rootDir The base directory to scan
 * @param currentRelativePath Current relative path from rootDir during recursion
 * @returns List of relative paths for matching source files
 */
export async function walkDirectory(
  rootDir: string,
  currentRelativePath = ''
): Promise<string[]> {
  const currentDir = path.resolve(rootDir, currentRelativePath);
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const matchedFiles: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip irrelevant/vendor/build directories to keep scans fast and relevant
      if (EXCLUDED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      const relativeSubDir = currentRelativePath
        ? path.join(currentRelativePath, entry.name)
        : entry.name;
      const subFiles = await walkDirectory(rootDir, relativeSubDir);
      matchedFiles.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        const relativeFilePath = currentRelativePath
          ? path.join(currentRelativePath, entry.name)
          : entry.name;
        matchedFiles.push(relativeFilePath);
      }
    }
  }

  return matchedFiles;
}
