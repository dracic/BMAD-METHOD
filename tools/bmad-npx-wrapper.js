#!/usr/bin/env node

/**
 * BMad Method CLI - Direct execution wrapper for npx
 * This file ensures proper execution when run via npx from GitHub or npm registry
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// Check if we're running in an npx/bunx temporary directory
const isNpxExecution = __dirname.includes('_npx') || __dirname.includes('.npm') || __dirname.includes('bunx-');

if (isNpxExecution) {
  // Running via npx/bunx - spawn child process to preserve user's working directory
  const args = process.argv.slice(2);
  const bmadCliPath = path.join(__dirname, 'cli', 'bmad-cli.js');

  if (!fs.existsSync(bmadCliPath)) {
    console.error('Error: Could not find bmad-cli.js at', bmadCliPath);
    console.error('Current directory:', __dirname);
    process.exit(1);
  }

  // Execute CLI from user's working directory (process.cwd()), not npm cache
  // Use spawnSync with argument array to avoid shell quoting issues with spaces in paths
  const result = spawnSync(process.execPath, [bmadCliPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  process.exit(result.status ?? (result.error ? 1 : 0));
} else {
  // Local execution - use require
  require('./cli/bmad-cli.js');
}
