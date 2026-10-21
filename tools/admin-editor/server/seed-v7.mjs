import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import { defineTextBlock } from "./text-block.mjs";
async function seedV7(store) {
  const source = await fs.readFile(new URL("../fixtures/upstream/obsidian.md", import.meta.url), "utf8");
  const provenance = JSON.parse(await fs.readFile(new URL("../fixtures/upstream/manifest.json", import.meta.url), "utf8"));
  const actualBlob = createHash("sha1").update("blob " + Buffer.byteLength(source) + "\0").update(source).digest("hex");
  if (actualBlob !== provenance.files[0].blob) throw new Error("Pinned upstream fixture changed; verify its provenance before initialization");
  const id = provenance.files[0].path;
  const mapping = defineTextBlock({ source, fragment: "它提供了优秀的 Markdown 编辑体验和知识管理功能。", title: "Obsidian指南 · 正文说明", baselineCommit: provenance.commit });
  return store.initialize({ [id]: source }, { [id]: mapping });
}
export {
  seedV7
};
