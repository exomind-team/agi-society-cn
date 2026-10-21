// A maintainer selects an exact text fragment; client-supplied offsets are never accepted.
// Surrounding frontmatter, Vue, links and formatting remain opaque and immutable.
import { createHash } from "node:crypto";
function defineTextBlock({ source, fragment, title, baselineCommit }) {
  const start = source.indexOf(fragment);
  if (!fragment || start < 0 || source.indexOf(fragment, start + fragment.length) !== -1) throw new Error("The trusted fragment must occur exactly once");
  validatePlainText(fragment);
  return { title, format: "protected-text-block", block: { prefix: source.slice(0, start), suffix: source.slice(start + fragment.length), baselineCommit, originalSourceSha256: createHash("sha256").update(source).digest("hex") } };
}
function validatePlainText(text) {
  if (typeof text !== "string" || /[\x00-\x1f\x7f<>\[\]{}*_`\\#|&!]/u.test(text)) throw new Error("此文字区暂不接受换行、HTML、链接、插值或 Markdown 排版符号；输入不会被自动删除。");
}
function extractTextBlock(source, block) {
  if (!source.startsWith(block.prefix) || !source.endsWith(block.suffix) || source.length < block.prefix.length + block.suffix.length) throw new Error("页面受保护结构已变化，需要维护者重新确认文字区。");
  return source.slice(block.prefix.length, source.length - block.suffix.length);
}
function replaceTextBlock({ source, block, text }) {
  extractTextBlock(source, block);
  validatePlainText(text);
  return block.prefix + text + block.suffix;
}
export {
  defineTextBlock,
  extractTextBlock,
  replaceTextBlock,
  validatePlainText
};
