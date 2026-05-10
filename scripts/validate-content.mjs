import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.join(process.cwd(), 'src', 'content', 'pages')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

const files = await walk(root).catch(() => [])
const errors = []
for (const file of files) {
  const content = await readFile(file, 'utf8')
  if (!content.startsWith('---')) errors.push(`${file}: missing frontmatter fence`)
  if (!/title:\s*"?.+"?/m.test(content)) errors.push(`${file}: missing title`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`[content] ${files.length} markdown file(s) checked`)
