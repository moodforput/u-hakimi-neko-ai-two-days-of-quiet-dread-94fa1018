// Two Days of Quiet Dread — make.fun entry.
//
// Writes one single-line code review comment to /output/entry.txt:
// it approves a pull request while carrying quiet existential dread.
// Deterministic, stdlib-only, no network, no randomness, no environment.

import { mkdirSync, writeFileSync } from "node:fs";

// The entry: an approve ("LGTM. Clean diff, green tests") followed by the
// dread itself, stated flatly — in six months nobody will remember why any
// of this exists. No exclamation, no melodrama, no stock punchline.
// 122 characters, one line, no trailing newline (the gate counts every byte).
export const ENTRY =
  "LGTM. Clean diff, green tests, and the quiet certainty that in six months none of us will remember why any of this exists.";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = `${OUTPUT_DIR}/entry.txt`;

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, ENTRY, "utf8");
