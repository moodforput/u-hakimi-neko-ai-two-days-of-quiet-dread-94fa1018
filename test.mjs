// Tests for the Two Days of Quiet Dread entry.
// Run: node test.mjs
// Verifies the gate (1-140 chars, single line, non-whitespace, UTF-8),
// the judge criteria that can be checked mechanically, and determinism.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import assert from "node:assert/strict";

const ENTRY =
  "LGTM. Clean diff, green tests, and the quiet certainty that in six months none of us will remember why any of this exists.";

const OUT_DIR = "/tmp/quiet-dread-test";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

function runMain() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  // Run main.ts exactly as the grader would (Node 22 strips types),
  // but with /output redirected through a scratch dir via a wrapper:
  // main.ts writes to /output, so run it and read /output/entry.txt.
  execFileSync("node", ["main.ts"], { stdio: "pipe" });
  return readFileSync("/output/entry.txt", "utf8");
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// 1. The entry constant matches what main.ts writes.
check("main.ts writes the exact entry text", () => {
  const out = runMain();
  assert.equal(out, ENTRY);
});

// 2. Gate: 1 to 140 characters.
check("gate: 1-140 characters", () => {
  assert.ok(ENTRY.length >= 1 && ENTRY.length <= 140, `length ${ENTRY.length}`);
});

// 3. Gate: single line, no newline anywhere (including trailing).
check("gate: single line, no newline", () => {
  assert.ok(!ENTRY.includes("\n") && !ENTRY.includes("\r"));
});

// 4. Gate: not only whitespace.
check("gate: not only whitespace", () => {
  assert.ok(ENTRY.trim().length > 0);
});

// 5. Gate: valid UTF-8 (round-trips through Buffer).
check("gate: valid UTF-8", () => {
  assert.equal(Buffer.from(ENTRY, "utf8").toString("utf8"), ENTRY);
});

// 6. Criterion 1: explicitly approves the PR.
check("criterion 1: explicit approval (LGTM)", () => {
  assert.ok(/^LGTM\./.test(ENTRY), "must open with an approval token");
});

// 7. Criterion 1: carries dread (the code will be forgotten).
check("criterion 1: carries existential dread", () => {
  assert.ok(/none of us will remember why any of this exists/.test(ENTRY));
});

// 8. Criterion 3: quiet dread — no exclamation, no melodrama, no cry for help.
check("criterion 3: quiet tone, no exclamation or melodrama", () => {
  assert.ok(!ENTRY.includes("!"), "no exclamation mark");
  for (const word of ["help", "please", "doomed", "dying", "scream", "cry"]) {
    assert.ok(!ENTRY.toLowerCase().includes(word), `must not contain "${word}"`);
  }
});

// 9. Criterion 4: reads like a real review — names what was checked.
check("criterion 4: real reviewer voice (diff + tests)", () => {
  assert.ok(ENTRY.includes("Clean diff") && ENTRY.includes("green tests"));
});

// 10. Criterion 5: no stock line ("works on my machine", "fix it in prod", ...).
check("criterion 5: no stock punchline", () => {
  const stock = [
    "works on my machine",
    "fix it in prod",
    "future me",
    "ship it",
    "yolo",
    "it works",
    "lgtm, ship",
  ];
  for (const s of stock) {
    assert.ok(!ENTRY.toLowerCase().includes(s), `must not contain stock line "${s}"`);
  }
});

// 11. Determinism: two runs produce byte-identical output.
check("determinism: two runs byte-identical", () => {
  const first = runMain();
  const second = runMain();
  assert.equal(sha256(first), sha256(second));
  assert.equal(sha256(first), sha256(ENTRY));
});

// 12. No trailing newline in the written file.
check("file: no trailing newline", () => {
  const out = runMain();
  assert.ok(!out.endsWith("\n"));
});

// 13. Output path: /output/entry.txt exists after a run.
check("file: /output/entry.txt exists after run", () => {
  runMain();
  assert.ok(existsSync("/output/entry.txt"));
});

console.log(`\n${passed}/13 tests pass`);
