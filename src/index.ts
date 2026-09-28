#!/usr/bin/env node
import { Command } from 'commander';
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
    console.log(`Scanning target directory: ${resolvedPath}`);

    const files = await walkDirectory(resolvedPath);
    console.log(`\nFound ${files.length} file(s) to scan:`);
    for (const file of files) {
      console.log(`  - ${file}`);
    }
  });

program.parse(process.argv);
