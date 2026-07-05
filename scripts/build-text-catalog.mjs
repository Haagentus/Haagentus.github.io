import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'texts', 'GI-Ebook');
const outputPath = path.join(root, 'texts', 'catalog.json');

const sections = [
  { dir: 'books', label: '书籍' },
  { dir: 'characters', label: '角色故事' },
  { dir: 'weapons', label: '武器' },
  { dir: 'artifacts', label: '圣遗物' }
];

function toUrlPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function getTitle(fileName) {
  return fileName.replace(/\.md$/i, '');
}

function getRegion(title) {
  const parts = title.split('-');
  return parts.length > 1 ? parts[0] : '';
}

const items = [];

for (const section of sections) {
  const sectionPath = path.join(sourceRoot, section.dir);
  const files = await readdir(sectionPath, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.md')) {
      continue;
    }

    const title = getTitle(file.name);
    const region = section.dir === 'characters' ? getRegion(title) : '';
    const cleanTitle = region ? title.replace(region + '-', '') : title;

    items.push({
      id: `${section.dir}/${title}`,
      title: cleanTitle,
      sourceTitle: title,
      category: section.label,
      region,
      path: toUrlPath(path.join('GI-Ebook', section.dir, file.name))
    });
  }
}

items.sort((a, b) => {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category, 'zh-Hans-CN');
  }
  if (a.region !== b.region) {
    return a.region.localeCompare(b.region, 'zh-Hans-CN');
  }
  return a.title.localeCompare(b.title, 'zh-Hans-CN');
});

await writeFile(outputPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'GI-Ebook',
  items
}, null, 2) + '\n', 'utf8');

console.log(`Wrote ${items.length} entries to ${path.relative(root, outputPath)}`);
