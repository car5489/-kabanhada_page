import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const catalogPath = path.join(publicDir, 'data', 'vehicle-catalog.json')

const convertibleExtensions = new Set(['.jpg', '.jpeg', '.png', '.svg', '.avif', '.tif', '.tiff'])
const pathLikeUrlPattern = /^[a-z]+:\/\//i

const toPosixPath = (value) => value.split(path.sep).join('/')

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const isLocalAsset = (src) => {
  return Boolean(src) && !src.startsWith('data:') && !pathLikeUrlPattern.test(src)
}

const webpPathFor = (src) => {
  const parsed = path.posix.parse(src.replace(/^\/+/, ''))
  return path.posix.join(parsed.dir, `${parsed.name}.webp`)
}

const optimizeImage = async (src, maxWidth = 1600) => {
  if (!isLocalAsset(src)) return src

  const normalizedSrc = src.replace(/^\/+/, '')
  const extension = path.posix.extname(normalizedSrc).toLowerCase()
  if (extension === '.webp') return normalizedSrc
  if (!convertibleExtensions.has(extension)) return normalizedSrc

  const sourcePath = path.join(publicDir, ...normalizedSrc.split('/'))
  if (!(await fileExists(sourcePath))) {
    console.warn(`[images] skipped missing asset: ${normalizedSrc}`)
    return normalizedSrc
  }

  const optimizedSrc = webpPathFor(normalizedSrc)
  const outputPath = path.join(publicDir, ...optimizedSrc.split('/'))

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(sourcePath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath)

  return toPosixPath(path.relative(publicDir, outputPath))
}

const main = async () => {
  const rawCatalog = await fs.readFile(catalogPath, 'utf8')
  const catalog = JSON.parse(rawCatalog)
  let convertedCount = 0

  for (const vehicle of catalog.vehicles ?? []) {
    const originalThumbnail = vehicle.thumbnail
    vehicle.thumbnail = await optimizeImage(vehicle.thumbnail, 900)
    if (vehicle.thumbnail !== originalThumbnail) convertedCount += 1

    for (const image of vehicle.images ?? []) {
      const originalSrc = image.src
      image.src = await optimizeImage(image.src, image.kind === 'thumbnail' ? 900 : 1600)
      if (image.src !== originalSrc) convertedCount += 1
    }
  }

  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
  console.log(`[images] optimized ${convertedCount} vehicle image reference(s) to WebP`)
}

main().catch((error) => {
  console.error('[images] failed to optimize vehicle images')
  console.error(error)
  process.exit(1)
})
