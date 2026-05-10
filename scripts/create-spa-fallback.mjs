import { copyFile, access } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const indexPath = path.join(root, 'dist', 'index.html')
const fallbackPath = path.join(root, 'dist', '404.html')

try {
  await access(indexPath)
  await copyFile(indexPath, fallbackPath)
  console.log('[spa] dist/404.html created')
} catch {
  console.warn('[spa] dist/index.html was not found. Skipped fallback creation.')
}
