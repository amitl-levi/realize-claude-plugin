#!/usr/bin/env node
'use strict';

/**
 * Unit tests for the support-bundle builder.
 *
 * Run: node skills/support/scripts/test-build-bundle.js
 *
 * These exist as a file rather than an inline `node -e` because the rules under
 * test are full of backslashes, quotes, and dollar signs. Passing those through
 * a shell twice produced two false results during review — a "leak" and a
 * "failure" that were both artifacts of the harness, not the code. A file has
 * no shell layer.
 *
 * No dependencies, no framework: Node ships with Claude Code and that is the
 * only thing this may assume.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const b = require('./build-bundle.js');

let passed = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) {
    passed++;
  } else {
    failures.push(detail ? `${name}\n      ${detail}` : name);
  }
}

function eq(name, actual, expected) {
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ---------------------------------------------------------------------------
// redaction — credentials out, business identifiers in
// ---------------------------------------------------------------------------

eq('JSON password scrubbed', b.redact('{"password": "dbadmin"}'), '{"password": "<redacted>"}');
eq('JSON access_token scrubbed', b.redact('{"access_token": "ya29.abcdef"}'), '{"access_token": "<redacted>"}');
eq('flat password= scrubbed', b.redact('password=hunter2supersecret'), 'password=<redacted>');
eq('flat client_secret= scrubbed', b.redact('client_secret=abcdef123456'), 'client_secret=<redacted>');
check('bearer token scrubbed', b.redact('Bearer sk-ant-api03-XXXXXXXXXXXX').includes('<redacted>'));
check('JWT scrubbed', b.redact('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sig').includes('<redacted-jwt>'));

// Ad copy must survive. Over-redaction destroys the evidence the bundle exists
// to carry, which is worse than the leak it was guarding against.
eq('ad copy "Secret:" preserved', b.redact('title=Secret: Summer Sale'), 'title=Secret: Summer Sale');
eq('ad copy "Authorization:" preserved', b.redact('title=Authorization: How To Apply'), 'title=Authorization: How To Apply');
eq('ad copy "Password Manager" preserved', b.redact('name=Password Manager Review'), 'name=Password Manager Review');

// PS cannot reproduce an issue without these.
eq('account_id preserved', b.redactValue('account_id', 'advertiser_12345_prod'), 'advertiser_12345_prod');
eq('campaign_id preserved', b.redactValue('campaign_id', '98765'), '98765');
eq('structural redaction by key name', b.redactValue('password', 'anything at all'), '<redacted>');

// ---------------------------------------------------------------------------
// table-cell safety
// ---------------------------------------------------------------------------

check('newline collapsed for table cell', !/\n/.test(b.oneLine('a=Line one\nLine two')));
check(
  'object param serialized, not [object Object]',
  (() => {
    const v = { type: 'EXCLUDE', value: ['p1', 'p2'] };
    const raw = v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v);
    const cell = b.oneLine(`publisher_targeting=${b.redactValue('publisher_targeting', raw)}`);
    return cell.includes('EXCLUDE') && !cell.includes('[object Object]');
  })()
);

// ---------------------------------------------------------------------------
// truncation leaves valid markdown
// ---------------------------------------------------------------------------

{
  const src = `# H\n\n\`\`\`\n${'é'.repeat(400)}\nstill inside\n`;
  const out = b.truncateToBytes(src, 200, '[cut]');
  check('byte cap respected', Buffer.byteLength(out, 'utf8') < 400);
  check('code fence balanced', ((out.match(/^```/gm) || []).length) % 2 === 0);
  check('no replacement char left', !new RegExp('�').test(out));
  eq('under-cap input untouched', b.truncateToBytes('short', 200, '[cut]'), 'short');
}
{
  const src = '<details><summary>x</summary>\n\n```\ndata here that goes on\n';
  const out = b.truncateToBytes(src, 40, '[cut]');
  check('<details> closed on truncation', (out.match(/<\/details>/g) || []).length >= 1);
}

// ---------------------------------------------------------------------------
// destination safety
// ---------------------------------------------------------------------------

{
  // Build the fake root with path.join so no backslash literals are involved.
  const root = path.join('C:', 'Users', 'tester', 'OneDrive');
  const prev = process.env.OneDrive;
  process.env.OneDrive = root;

  check('OneDrive path flagged (native separators)', b.isCloudSynced(path.join(root, 'Desktop', 'f.md')));
  check(
    'OneDrive path flagged (forward slashes)',
    b.isCloudSynced(`${root.replace(/\\/g, '/')}/Desktop/f.md`)
  );
  check('non-OneDrive path not flagged', !b.isCloudSynced(path.join('C:', 'Users', 'tester', 'Downloads', 'f.md')));
  check('no false prefix match on OneDriveX', !b.isCloudSynced(path.join('C:', 'Users', 'tester', 'OneDriveX', 'f.md')));

  if (prev === undefined) delete process.env.OneDrive;
  else process.env.OneDrive = prev;
}

// Anchored to the checkout, not the caller's cwd, so the suite passes when run
// from anywhere.
check('this repo detected as a git work tree', b.findGitRoot(__dirname) !== null);
check('temp dir is not a git work tree', b.findGitRoot(os.tmpdir()) === null);
check('default destination is outside any git work tree', b.findGitRoot(path.dirname(b.defaultOutPath('abc12345'))) === null);

{
  const p = path.join(os.tmpdir(), `collide-${process.pid}.md`);
  fs.writeFileSync(p, 'x');
  const next = b.nextAvailablePath(p);
  check('collision yields a free name', next !== p && !fs.existsSync(next));
  fs.unlinkSync(p);
}

// ---------------------------------------------------------------------------
// result truncation is tiered by how diagnostic the output is
// ---------------------------------------------------------------------------

{
  const bigCsv = `Records: 250 | Total: 1830\n${Array.from({ length: 400 }, (_, i) => `itm_${i},creative ${i},1234.56,987,0.44,37,33.37`).join('\n')}`;

  const records = [
    {
      type: 'assistant',
      message: {
        content: [
          { type: 'tool_use', id: 'call_realize', name: 'mcp__realize-mcp__get_top_campaign_content_report', input: {} },
          { type: 'tool_use', id: 'call_bash', name: 'Bash', input: {} },
        ],
      },
    },
    {
      type: 'user',
      message: {
        content: [
          { type: 'tool_result', tool_use_id: 'call_realize', content: [{ type: 'text', text: bigCsv }] },
          { type: 'tool_result', tool_use_id: 'call_bash', content: [{ type: 'text', text: bigCsv }] },
        ],
      },
    },
  ];

  const out = b.renderTranscript(records);
  const blocks = out.split('<details>').slice(1);
  check('two tool results rendered', blocks.length === 2);

  const realizeRows = (blocks[0].match(/^itm_/gm) || []).length;
  const bashRows = (blocks[1].match(/^itm_/gm) || []).length;

  check(
    'Realize result keeps far more rows than other output',
    realizeRows > bashRows * 5,
    `realize kept ${realizeRows} rows, bash kept ${bashRows}`
  );
  check(
    'Realize result keeps a diagnostically useful number of rows',
    realizeRows > 150,
    `only ${realizeRows} rows survived`
  );
  // ~42 chars per row against a 2,000-char cap lands near 47 rows.
  check('non-Realize output stays tightly capped', bashRows < 60, `bash kept ${bashRows} rows`);
  check('caps are actually different', b.MAX_REALIZE_RESULT_CHARS > b.MAX_RESULT_CHARS);
}

// ---------------------------------------------------------------------------
// tool matching
// ---------------------------------------------------------------------------

check('matches plugin MCP tools', b.REALIZE_TOOL.test('mcp__realize-mcp__search_accounts'));
check('matches claude.ai connector tools', b.REALIZE_TOOL.test('mcp__claude_ai_Realize_MCP__authenticate'));
check('does not match unrelated MCP tools', !b.REALIZE_TOOL.test('mcp__sage__assist'));
check('does not match plain tools', !b.REALIZE_TOOL.test('Bash'));

// ---------------------------------------------------------------------------

console.log(`${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('');
  for (const f of failures) console.error(`  FAIL: ${f}`);
  process.exit(1);
}
