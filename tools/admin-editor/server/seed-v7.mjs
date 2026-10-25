import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import { defineTextBlock } from "./text-block.mjs";
const fixtureChanged = () => new Error("Pinned upstream fixture changed; verify its provenance before initialization");
const gitBlob = (bytes) => createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");

// Compare original bytes first. Only a uniform CRLF checkout may fall back to
// the exact pinned LF bytes. Never rewrite the input file or Git configuration.
function verifyPinnedFixture(bytes, expectedBlob) {
  if (gitBlob(bytes) === expectedBlob) return bytes.toString("utf8");
  let pairs = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 13) {
      if (bytes[i + 1] !== 10) throw fixtureChanged();
      pairs++;
      i++;
    } else if (bytes[i] === 10) {
      // Mixed LF/CRLF is not a normal full-file checkout conversion.
      throw fixtureChanged();
    }
  }
  if (!pairs) throw fixtureChanged();
  const canonical = bytes.filter((byte) => byte !== 13);
  if (gitBlob(canonical) !== expectedBlob) throw fixtureChanged();
  return canonical.toString("utf8");
}

async function seedV7(store) {
  const bytes = await fs.readFile(new URL("../fixtures/upstream/obsidian.md", import.meta.url));
  const provenance = JSON.parse(await fs.readFile(new URL("../fixtures/upstream/manifest.json", import.meta.url), "utf8"));
  const source = verifyPinnedFixture(bytes, provenance.files[0].blob);
  const id = provenance.files[0].path;
  const mapping = defineTextBlock({ source, fragment: "它提供了优秀的 Markdown 编辑体验和知识管理功能。", title: "Obsidian指南 · 正文说明", baselineCommit: provenance.commit });
  return store.initialize({ [id]: source }, { [id]: mapping });
}
export {
  seedV7,
  verifyPinnedFixture
};
