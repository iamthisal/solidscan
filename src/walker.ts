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
 * Recursively walks a directory and returns relative paths of all files matching supported extensions.
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
    const relativePath = currentRelativePath
      ? path.join(currentRelativePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      const subFiles = await walkDirectory(rootDir, relativePath);
      matchedFiles.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        matchedFiles.push(relativePath);
      }
    }
  }

  return matchedFiles;
}
