/**
 * TDD Test: Wikilink relative path resolution
 *
 * Simulates: [[annual/index|查看年会总览 →]] in conference/index.md
 * Expected: renders as <a href="conference/annual/index"> link
 */
import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links';

// Setup temp dir simulating content structure
const tmpDir = path.join(process.env.TEMP || '/tmp', 'wikilink-test-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'conference'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'conference', 'annual'), { recursive: true });

// Create target file and source file
fs.writeFileSync(path.join(tmpDir, 'conference', 'annual', 'index.md'), '# 年会总览\n');
fs.writeFileSync(path.join(tmpDir, 'conference', 'index.md'), '# 学术会议\n\n[[annual/index|查看年会总览 →]]\n');

// Read the source markdown
const src = fs.readFileSync(path.join(tmpDir, 'conference', 'index.md'), 'utf8');

// Create markdown-it instance with bidirectional links plugin
const md = new MarkdownIt();
md.use(BiDirectionalLinks({
  dir: tmpDir,
  isRelativePath: true,
}));

// Render with env.path set to the source file
const env = { path: path.join(tmpDir, 'conference', 'index.md'), relativePath: 'conference/index.md' };
const html = md.render(src, env);

console.log('INPUT:', src.trim());
console.log('OUTPUT:', html.trim());

// Assertions
const hasLink = html.includes('<a ');
const hasHref = html.includes('conference/annual/index') || html.includes('annual/index');
const notRawWikilink = !html.includes('[[');

console.log('\n--- RESULTS ---');
console.log('Has <a> tag:', hasLink ? '✅' : '❌ FAIL');
console.log('Has correct href:', hasHref ? '✅' : '❌ FAIL');
console.log('Not raw wikilink:', notRawWikilink ? '✅' : '❌ FAIL');

const allPass = hasLink && hasHref && notRawWikilink;
console.log('\n' + (allPass ? '✅ ALL PASS' : '❌ TEST FAILED'));

// Cleanup
fs.rmSync(tmpDir, { recursive: true });
process.exit(allPass ? 0 : 1);
