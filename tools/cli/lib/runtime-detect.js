/**
 * Runtime detection utility for Bun/Node.js compatibility.
 * Provides runtime-aware command builders for child process spawning.
 */

const isBun = typeof Bun !== 'undefined';

const UNSUPPORTED_BUN_FLAGS = new Set(['--no-audit', '--no-fund', '--no-progress', '--legacy-peer-deps']);

function installCmd(flags = '') {
  if (!isBun) return `npm install ${flags}`.trim();
  // Split into individual flags to avoid partial-match corruption
  const parts = flags.split(/\s+/).filter(Boolean);
  // Handle both --omit=dev and --omit dev, strip unsupported flags
  const finalParts = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '--omit=dev') {
      finalParts.push('--production');
    } else if (parts[i] === '--omit' && parts[i + 1] === 'dev') {
      finalParts.push('--production');
      i++; // Skip 'dev'
    } else if (!UNSUPPORTED_BUN_FLAGS.has(parts[i])) {
      finalParts.push(parts[i]);
    }
  }
  return `bun install${finalParts.length > 0 ? ' ' + finalParts.join(' ') : ''}`;
}

function viewCmd(packageName, field = '') {
  if (isBun) {
    return `bun info "${packageName}"${field ? ' ' + field : ''}`;
  }
  return `npm view "${packageName}"${field ? ' ' + field : ''}`;
}

module.exports = Object.freeze({
  isBun,
  runtime: process.execPath,
  runtimeName: isBun ? 'bun' : 'node',
  pm: isBun ? 'bun' : 'npm',
  pmx: isBun ? 'bunx' : 'npx',
  installCmd,
  viewCmd,
});
