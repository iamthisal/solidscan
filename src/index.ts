#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { walkDirectory } from './walker.js';

const program = new Command();

program
  .name('solidscan')
  .description('A CLI tool that scans AI-generated codebases for SOLID principle violations, code smells, and security risks')
  .version('0.1.0')
  .argument('<path>', 'path to the directory to scan')
  .action(async (targetPath: string) => {
    // Resolve relative path to absolute path to normalize filesystem operations
    const resolvedPath = path.resolve(targetPath);

    // Validate that the target path exists and is indeed a directory
    try {
      const stats = await fs.stat(resolvedPath);
      if (!stats.isDirectory()) {
        console.error(`Error: Path is not a directory: "${resolvedPath}"`);
        process.exit(1);
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error(`Error: Path does not exist: "${resolvedPath}"`);
      } else {
        console.error(`Error accessing path "${resolvedPath}": ${(err as Error).message}`);
      }
      process.exit(1);
    }

    console.log(`Scanning target directory: ${resolvedPath}`);

    try {
      const files = await walkDirectory(resolvedPath);
      console.log(`\nFound ${files.length} file(s) to scan:`);
      for (const file of files) {
        console.log(`  - ${file}`);
      }
    } catch (err: unknown) {
      console.error(`Error scanning directory "${resolvedPath}": ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
