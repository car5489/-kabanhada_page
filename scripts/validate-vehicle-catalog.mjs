import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const catalogPath = path.join(root, 'public', 'data', 'vehicle-catalog.json')
const errorsPath = path.join(root, 'public', 'data', 'vehicle-catalog.errors.json')

function error(sheet, row, field, value, message) {
  return { level: 'error', sheet, row, field, value: String(value ?? ''), message }
}

function isString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const allowedStatus = new Set(['available', 'reserved', 'sold', 'hidden'])
const allowedImageKind = new Set(['thumbnail', 'gallery'])

let catalog
try {
  catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
} catch (err) {
  console.error(`[validate] could not read ${catalogPath}`)
  process.exit(1)
}

const errors = []
if (!isString(catalog.schemaVersion)) errors.push(error('catalog', 0, 'schemaVersion', catalog.schemaVersion, 'schemaVersion is required.'))
if (!isString(catalog.generatedAt)) errors.push(error('catalog', 0, 'generatedAt', catalog.generatedAt, 'generatedAt is required.'))
if (!Array.isArray(catalog.vehicles)) errors.push(error('catalog', 0, 'vehicles', '', 'vehicles must be an array.'))

const ids = new Set()
for (const [index, vehicle] of (catalog.vehicles ?? []).entries()) {
  const row = index + 2
  if (!isString(vehicle.id)) errors.push(error('vehicles', row, 'id', vehicle.id, 'vehicle id is required.'))
  if (ids.has(vehicle.id)) errors.push(error('vehicles', row, 'id', vehicle.id, 'vehicle id must be unique.'))
  ids.add(vehicle.id)
  if (!allowedStatus.has(vehicle.status)) errors.push(error('vehicles', row, 'status', vehicle.status, 'invalid status.'))
  if (!isString(vehicle.title)) errors.push(error('vehicles', row, 'title', vehicle.title, 'title is required.'))
  if (!Number.isInteger(vehicle.sortOrder)) errors.push(error('vehicles', row, 'sortOrder', vehicle.sortOrder, 'sortOrder must be an integer.'))
  if (!isString(vehicle.thumbnail)) errors.push(error('vehicles', row, 'thumbnail', vehicle.thumbnail, 'thumbnail is required.'))

  const profile = vehicle.profile ?? {}
  for (const field of ['vehicleType', 'brand', 'model', 'shortDescription', 'detailDescription']) {
    if (!isString(profile[field])) errors.push(error('vehicles', row, `profile.${field}`, profile[field], `${field} is required.`))
  }
  if (!Number.isInteger(profile.year)) errors.push(error('vehicles', row, 'profile.year', profile.year, 'year must be an integer.'))
  if (!Number.isInteger(profile.mileageKm)) errors.push(error('vehicles', row, 'profile.mileageKm', profile.mileageKm, 'mileageKm must be an integer.'))

  if (!Array.isArray(vehicle.images) || vehicle.images.length === 0) {
    errors.push(error('vehicleImages', row, 'images', '', 'at least one image is required.'))
  } else {
    const thumbnails = vehicle.images.filter((image) => image.kind === 'thumbnail')
    if (thumbnails.length !== 1) errors.push(error('vehicleImages', row, 'kind', thumbnails.length, 'exactly one thumbnail is required.'))
    for (const image of vehicle.images) {
      if (!isString(image.id)) errors.push(error('vehicleImages', row, 'image.id', image.id, 'image id is required.'))
      if (!allowedImageKind.has(image.kind)) errors.push(error('vehicleImages', row, 'image.kind', image.kind, 'invalid image kind.'))
      if (!isString(image.src)) errors.push(error('vehicleImages', row, 'image.src', image.src, 'image src is required.'))
      if (!isString(image.alt)) errors.push(error('vehicleImages', row, 'image.alt', image.alt, 'image alt is required.'))
    }
  }

  if (vehicle.contact) {
    if (!/^\d+$/.test(vehicle.contact.phoneRaw ?? '')) errors.push(error('vehicles', row, 'contact.phoneRaw', vehicle.contact.phoneRaw, 'phoneRaw must contain digits only.'))
  }
}

const report = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  hasBlockingErrors: errors.length > 0,
  errors,
}

await mkdir(path.dirname(errorsPath), { recursive: true })
await writeFile(errorsPath, JSON.stringify(report, null, 2), 'utf8')

if (errors.length > 0) {
  console.error(`[validate] ${errors.length} blocking error(s). See public/data/vehicle-catalog.errors.json`)
  process.exit(1)
}

console.log('[validate] kabanhada catalog is valid')
