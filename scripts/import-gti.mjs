import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content', 'research', 'nars', 'theory', 'gti');
const PROXY = 'http://localhost:3456';
const TARGET = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length);
const WRITE = process.argv.includes('--write');
const NL = String.fromCharCode(10);

if (!TARGET) {
  throw new Error('Usage: node scripts/import-gti.mjs --target=<CDP target id> [--write]');
}

const chapters = [
  { number: 1, sections: [1, 2, 3] },
  { number: 2, sections: [1, 2, 3, 4] },
  { number: 3, sections: [1, 2, 3, 4, 5] },
  { number: 4, sections: [1, 2, 3, 4, 5] },
  { number: 5, sections: [1, 2, 3, 4, 5] },
];

const topicMap = new Map([
  ['GTI-WorkingDefinition.html', 'working_definition'],
  ['GTI-AIorAGI.html', 'ai_or_agi'],
  ['GTI-AmountOfInformation.html', 'amount_of_information'],
  ['GTI-IntelligenceAndEvolution.html', 'intelligence_and_evolution'],
]);

async function request(pathname, options = {}) {
  const response = await fetch(`${PROXY}${pathname}`, options);
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`);
  return response.json();
}

async function navigate(url) {
  await request(`/navigate?target=${encodeURIComponent(TARGET)}&url=${encodeURIComponent(url)}`);
}

function cleanText(value) {
  return String(value ?? '')
    .split(String.fromCharCode(10)).join(' ')
    .split(String.fromCharCode(13)).join(' ')
    .split(String.fromCharCode(9)).join(' ')
    .split(' ').filter(Boolean).join(' ')
    .trim();
}

function sourceUrl(chapter, section = null) {
  if (section === null) return `https://cis.temple.edu/~pwang/GTI-book/GTI-CH${chapter}/GTI-${chapter}.html`;
  return `https://cis.temple.edu/~pwang/GTI-book/GTI-CH${chapter}/GTI-${chapter}-${section}.html`;
}

function linkTarget(href, label, currentChapter) {
  const absolute = new URL(href, 'https://cis.temple.edu/~pwang/GTI-book/');
  const filename = absolute.pathname.split('/').filter(Boolean).pop() ?? '';
  const sectionMatch = filename.replace('.html', '').split('-');
  if (sectionMatch.length === 3 && sectionMatch[0] === 'GTI') {
    const chapter = Number(sectionMatch[1]);
    const section = sectionMatch[2];
    const target = chapter === currentChapter ? `${sectionMatch[1]}.${section}` : `research/nars/theory/gti/chapter${chapter}/${sectionMatch[1]}.${section}`;
    return `[[${target}|${label}]]`;
  }
  if (sectionMatch.length === 2 && sectionMatch[0] === 'GTI' && Number.isInteger(Number(sectionMatch[1]))) {
    const chapter = Number(sectionMatch[1]);
    const target = chapter === currentChapter ? 'index' : `research/nars/theory/gti/chapter${chapter}/index`;
    return `[[${target}|${label}]]`;
  }
  if (filename === 'GTI-Preface.html') return `[[research/nars/theory/gti/preface|${label}]]`;
  if (filename === 'GTI-Acknowledgment.html') return `[[research/nars/theory/gti/acknowledgment|${label}]]`;
  if (filename === 'GTI-Bibliography.html') return `[[research/nars/theory/gti/bibliography|${label}]]`;
  if (filename === 'index.html' || filename === '') return `[[research/nars/theory/gti/index|${label}]]`;
  if (topicMap.has(filename)) return `[[research/nars/theory/gti/topics/${topicMap.get(filename)}|${label}]]`;
  return `[${label}](${absolute.href})`;
}

function extractExpression(currentChapter) {
  return `(() => {
    const chapter = ${currentChapter};
    const clean = (value) => String(value || '').split(String.fromCharCode(10)).join(' ').split(String.fromCharCode(13)).join(' ').split(String.fromCharCode(9)).join(' ').split(' ').filter(Boolean).join(' ').trim();
    const absolute = (href) => new URL(href, document.location.href).href;
    const link = (href, label) => {
      const url = new URL(href, 'https://cis.temple.edu/~pwang/GTI-book/');
      const filename = url.pathname.split('/').filter(Boolean).pop() || '';
      const parts = filename.replace('.html', '').split('-');
      if (parts.length === 3 && parts[0] === 'GTI') {
        const n = Number(parts[1]);
        const target = n === chapter ? parts[1] + '.' + parts[2] : 'research/nars/theory/gti/chapter' + n + '/' + parts[1] + '.' + parts[2];
        return '[[' + target + '|' + label + ']]';
      }
      if (parts.length === 2 && parts[0] === 'GTI' && Number.isInteger(Number(parts[1]))) {
        const n = Number(parts[1]);
        const target = n === chapter ? 'index' : 'research/nars/theory/gti/chapter' + n + '/index';
        return '[[' + target + '|' + label + ']]';
      }
      if (filename === 'GTI-Preface.html') return '[[research/nars/theory/gti/preface|' + label + ']]';
      if (filename === 'GTI-Acknowledgment.html') return '[[research/nars/theory/gti/acknowledgment|' + label + ']]';
      if (filename === 'GTI-Bibliography.html') return '[[research/nars/theory/gti/bibliography|' + label + ']]';
      if (filename === 'index.html' || filename === '') return '[[research/nars/theory/gti/index|' + label + ']]';
      const topics = {
        'GTI-WorkingDefinition.html': 'working_definition',
        'GTI-AIorAGI.html': 'ai_or_agi',
        'GTI-AmountOfInformation.html': 'amount_of_information',
        'GTI-IntelligenceAndEvolution.html': 'intelligence_and_evolution'
      };
      if (topics[filename]) return '[[research/nars/theory/gti/topics/' + topics[filename] + '|' + label + ']]';
      return '[' + label + '](' + absolute(href) + ')';
    };
    const inline = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return clean(node.nodeValue);
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') return '  ' + String.fromCharCode(10);
      if (tag === 'a') return link(node.getAttribute('href') || '', clean(node.textContent));
      const text = Array.from(node.childNodes).map(inline).join('');
      if (tag === 'i' || tag === 'em') return '*' + text + '*';
      if (tag === 'b' || tag === 'strong') return '**' + text + '**';
      return text;
    };
    const h1 = document.querySelector('h1');
    const blocks = [];
    const walk = (node) => {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'center', 'nav', 'h1'].includes(tag)) return;
      if (['h2', 'h3', 'h4'].includes(tag)) {
        const text = clean(inline(node));
        if (text) blocks.push('## ' + text);
        return;
      }
      if (tag === 'p') {
        const text = clean(inline(node));
        if (text) blocks.push(text);
        return;
      }
      if (tag === 'blockquote') {
        const text = clean(inline(node));
        if (text) blocks.push('> ' + text);
        return;
      }
      if (tag === 'li') {
        const text = clean(inline(node));
        if (text) blocks.push('- ' + text);
        return;
      }
      if (tag === 'hr') { blocks.push('---'); return; }
      Array.from(node.children).forEach(walk);
    };
    Array.from(document.body.children).forEach(walk);
    return { title: clean(h1 ? h1.textContent : document.title), body: blocks.join(String.fromCharCode(10) + String.fromCharCode(10)) };
  })()`;
}

async function extract(chapter, url) {
  await navigate(url);
  const result = await request(`/eval?target=${encodeURIComponent(TARGET)}`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8' },
    body: extractExpression(chapter),
  });
  if (!result || !result.value) throw new Error(`No DOM result for ${url}`);
  const value = result.value;
  value.body = value.body.split('[Special Topic:').join('Special Topic: ').split(']]]').join(']]');
  return value;
}

function header(source, note) {
  return ['---', 'comments: true', '---', ''].join(NL);
}

function chapterPage(chapter, data) {
  const body = data.body.startsWith('---') ? data.body.slice(3).trimStart() : data.body;
  return header(sourceUrl(chapter), '原站章节内链已转换为本地 wikilink') + ['# ' + data.title, '', `[英文原文↗](${sourceUrl(chapter)})`, '', '[[index|🔙上一级]]', '', '> 本页为 Temple University GTI 原始 eBook 的英文内容镜像；原站章节内链已转换为本地 wikilink。', '', '* * *', '', body, ''].join(NL);
}

function sectionPage(chapter, section, data) {
  const prefix = `Section ${chapter}.${section}. `;
  const title = data.title.startsWith(prefix) ? data.title.slice(prefix.length) : data.title;
  return header(sourceUrl(chapter, section), '原站章节内链已转换为本地 wikilink') + [`# ${prefix}${title}`, '', `[英文原文↗](${sourceUrl(chapter, section)})`, '', '[[index|🔙上一级]]', '', '> 本页为 Temple University GTI 原始 eBook 的英文内容镜像；原站章节内链已转换为本地 wikilink。', '', data.body, ''].join(NL);
}

const outputs = [];
for (const chapter of chapters) {
  const chapterData = await extract(chapter.number, sourceUrl(chapter.number));
  outputs.push({ file: path.join(CONTENT, `chapter${chapter.number}`, 'index.md'), text: chapterPage(chapter.number, chapterData) });
  for (const section of chapter.sections) {
    const sectionData = await extract(chapter.number, sourceUrl(chapter.number, section));
    outputs.push({ file: path.join(CONTENT, `chapter${chapter.number}`, `${chapter.number}.${section}.md`), text: sectionPage(chapter.number, section, sectionData) });
  }
}

if (WRITE) {
  for (const output of outputs) {
    await fs.mkdir(path.dirname(output.file), { recursive: true });
    await fs.writeFile(output.file, output.text, 'utf8');
  }
}

console.log(JSON.stringify({ write: WRITE, pages: outputs.length, files: outputs.map((item) => path.relative(ROOT, item.file)) }, null, 2));
