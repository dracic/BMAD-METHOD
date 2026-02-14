/**
 * Unit tests for tools/cli/lib/runtime-detect.js
 * Verifies Node.js runtime detection and command generation.
 * Bun-specific paths require running under Bun.
 */

const rt = require('../tools/cli/lib/runtime-detect');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \u001B[32m✓\u001B[0m ${message}`);
    passed++;
  } else {
    console.log(`  \u001B[31m✗\u001B[0m ${message}`);
    failed++;
  }
}

// --- Detection ---
console.log('\u001B[34mRuntime Detection\u001B[0m');
assert(typeof rt.isBun === 'boolean', 'isBun is a boolean');
assert(typeof rt.runtime === 'string', 'runtime is a string');
assert(typeof rt.runtimeName === 'string', 'runtimeName is a string');
assert(typeof rt.pm === 'string', 'pm is a string');
assert(typeof rt.pmx === 'string', 'pmx is a string');

// Under Node.js, verify Node-specific values
if (!rt.isBun) {
  console.log('\u001B[34mNode.js Specific Values\u001B[0m');
  assert(rt.runtimeName === 'node', 'runtimeName is "node"');
  assert(rt.pm === 'npm', 'pm is "npm"');
  assert(rt.pmx === 'npx', 'pmx is "npx"');
}

// Under Bun, verify Bun-specific values
if (rt.isBun) {
  console.log('\u001B[34mBun Specific Values\u001B[0m');
  assert(rt.runtimeName === 'bun', 'runtimeName is "bun"');
  assert(rt.pm === 'bun', 'pm is "bun"');
  assert(rt.pmx === 'bunx', 'pmx is "bunx"');
}

// --- Object.freeze ---
console.log('\u001B[34mObject Freeze\u001B[0m');
assert(Object.isFrozen(rt), 'module export is frozen');

// --- installCmd ---
console.log('\u001B[34minstallCmd()\u001B[0m');
if (!rt.isBun) {
  assert(rt.installCmd('--omit=dev --no-audit') === 'npm install --omit=dev --no-audit', 'Node: passes flags through unchanged');
  assert(rt.installCmd('') === 'npm install', 'Node: empty flags produces "npm install"');
  assert(rt.installCmd() === 'npm install', 'Node: no args produces "npm install"');
}

// Test flag stripping logic (functional test - works under both runtimes conceptually)
// We test the string manipulation by checking Node path since Bun path strips flags
if (!rt.isBun) {
  assert(
    rt.installCmd('--omit=dev --no-audit --no-fund --no-progress --legacy-peer-deps') ===
      'npm install --omit=dev --no-audit --no-fund --no-progress --legacy-peer-deps',
    'Node: all flags passed through',
  );
}

// --- viewCmd ---
console.log('\u001B[34mviewCmd()\u001B[0m');
if (!rt.isBun) {
  assert(rt.viewCmd('bmad-method', 'version') === 'npm view "bmad-method" version', 'Node: npm view with field');
  assert(rt.viewCmd('bmad-method') === 'npm view "bmad-method"', 'Node: npm view without field');
}
if (rt.isBun) {
  assert(rt.viewCmd('bmad-method', 'version') === 'bun info "bmad-method" version', 'Bun: bun info with field');
  assert(rt.viewCmd('bmad-method') === 'bun info "bmad-method"', 'Bun: bun info without field');
}

// --- Summary ---
console.log();
console.log(`\u001B[36mTest Results:\u001B[0m`);
console.log(`  Total:  ${passed + failed}`);
console.log(`  Passed: \u001B[32m${passed}\u001B[0m`);
console.log(`  Failed: ${failed > 0 ? `\u001B[31m${failed}\u001B[0m` : `\u001B[32m${failed}\u001B[0m`}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n\u001B[32m✨ All tests passed!\u001B[0m');
}
