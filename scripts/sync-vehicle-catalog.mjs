import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const catalogPath = path.join(root, 'public', 'data', 'vehicle-catalog.json')
const errorsPath = path.join(root, 'public', 'data', 'vehicle-catalog.errors.json')
const VEHICLES_SHEET_NAME = 'vehicles'
const SETTINGS_SHEET_NAME = 'settings'

function requireEnv(name) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : ''
}

function normalizeKey(key) {
  return String(key ?? '').trim()
}

function normalizeHeader(key) {
  return normalizeKey(key).replace(/\s+/g, '')
}

function normalizeValue(value) {
  return String(value ?? '').trim()
}

function toRows(values) {
  const [headers = [], ...rows] = values ?? []
  const normalizedHeaders = headers.map(normalizeHeader)

  return rows
    .map((row, rowIndex) => {
      const item = { __row: rowIndex + 2 }
      normalizedHeaders.forEach((header, index) => {
        if (!header) return
        item[header] = normalizeValue(row[index])
      })
      return item
    })
    .filter((row) => Object.entries(row).some(([key, value]) => key !== '__row' && normalizeValue(value).length > 0))
}

function toInt(value, fallback = undefined) {
  if (value === '' || value === undefined || value === null) return fallback
  const parsed = Number(String(value).replaceAll(',', '').trim())
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN
}

function toVisible(value) {
  const normalized = normalizeValue(value).toUpperCase()
  return normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE' || normalized === '1'
}

function toDigits(value) {
  return normalizeValue(value).replace(/[^0-9]/g, '')
}

function withDefault(value, fallback) {
  const normalized = normalizeValue(value)
  return normalized || fallback
}

function stripLeadingSlash(value) {
  return normalizeValue(value).replace(/^\/+/, '')
}

function extractYoutubeId(url) {
  const value = normalizeValue(url)
  if (!value) return ''

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{6,})/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return /^[A-Za-z0-9_-]{6,}$/.test(value) ? value : ''
}

function error(sheet, row, field, value, message) {
  return { level: 'error', sheet, row, field, value: String(value ?? ''), message }
}

async function writeReport(errors) {
  const report = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    hasBlockingErrors: errors.length > 0,
    errors,
  }
  await mkdir(path.dirname(errorsPath), { recursive: true })
  await writeFile(errorsPath, JSON.stringify(report, null, 2), 'utf8')
}

async function readExistingOrExit() {
  if (process.env.REQUIRE_GOOGLE_SHEET === '1') {
    console.error('[sync] Google Sheet secrets are required, but missing.')
    process.exit(1)
  }

  try {
    await readFile(catalogPath, 'utf8')
    await writeReport([])
    console.log('[sync] Google Sheet env missing. Kept existing sample catalog.')
  } catch {
    console.error('[sync] Google Sheet env missing and no sample catalog exists.')
    process.exit(1)
  }
}

function readSetting(settingsRows, key, fallback = '') {
  const found = settingsRows.find((row) => normalizeValue(row['항목']) === key)
  return withDefault(found?.['값'], fallback)
}

function buildImages(row, title, vehicleId, errors) {
  const images = []
  const thumbnail = stripLeadingSlash(row['대표사진'])

  if (thumbnail) {
    images.push({
      id: `${vehicleId}-thumbnail`,
      kind: 'thumbnail',
      src: thumbnail,
      alt: `${title} 대표 이미지`,
      sortOrder: 1,
    })
  }

  for (const index of [1, 2, 3]) {
    const src = stripLeadingSlash(row[`사진${index}`])
    if (!src) continue

    images.push({
      id: `${vehicleId}-gallery-${index}`,
      kind: 'gallery',
      src,
      alt: withDefault(row[`사진${index}설명`], `${title} 상세 이미지 ${index}`),
      sortOrder: index + 1,
    })
  }

  if (!thumbnail) {
    errors.push(error(VEHICLES_SHEET_NAME, row.__row, '대표사진', row['대표사진'], '대표사진 is required.'))
  }

  return { thumbnail, images }
}

function validateVehicleRow(row, seenIds, errors) {
  const id = normalizeValue(row['차량ID'])

  if (!id) errors.push(error(VEHICLES_SHEET_NAME, row.__row, '차량ID', id, '차량ID is required.'))
  if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    errors.push(error(VEHICLES_SHEET_NAME, row.__row, '차량ID', id, '차량ID must use lowercase letters, numbers, and hyphens only.'))
  }
  if (id && seenIds.has(id)) errors.push(error(VEHICLES_SHEET_NAME, row.__row, '차량ID', id, '차량ID must be unique.'))
  seenIds.add(id)

  for (const field of ['노출여부', '차량명', '브랜드', '모델', '차종', '연식', '주행거리', '짧은설명', '대표사진']) {
    if (!normalizeValue(row[field])) errors.push(error(VEHICLES_SHEET_NAME, row.__row, field, row[field], `${field} is required.`))
  }

  const visibleRaw = normalizeValue(row['노출여부']).toUpperCase()
  if (visibleRaw && !['Y', 'N', 'YES', 'NO', 'TRUE', 'FALSE', '1', '0'].includes(visibleRaw)) {
    errors.push(error(VEHICLES_SHEET_NAME, row.__row, '노출여부', row['노출여부'], '노출여부 must be Y or N.'))
  }

  const year = toInt(row['연식'])
  if (!Number.isInteger(year)) errors.push(error(VEHICLES_SHEET_NAME, row.__row, '연식', row['연식'], '연식 must be a number.'))

  const mileageKm = toInt(row['주행거리'])
  if (!Number.isInteger(mileageKm)) errors.push(error(VEHICLES_SHEET_NAME, row.__row, '주행거리', row['주행거리'], '주행거리 must be a number.'))

  const youtubeUrl = normalizeValue(row['유튜브URL'])
  if (youtubeUrl && !extractYoutubeId(youtubeUrl)) {
    errors.push(error(VEHICLES_SHEET_NAME, row.__row, '유튜브URL', youtubeUrl, '유튜브URL must be a valid YouTube link.'))
  }
}

async function readSheet(sheets, spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    return toRows(response.data.values ?? [])
  } catch (err) {
    const reason = err?.response?.data?.error?.message ?? err?.message ?? String(err)
    console.error(`[sync] could not read sheet range "${range}".`)
    console.error(`[sync] ${reason}`)
    console.error(`[sync] Required tabs: "${VEHICLES_SHEET_NAME}" and "${SETTINGS_SHEET_NAME}".`)
    throw err
  }
}

const spreadsheetId = requireEnv('GOOGLE_SHEET_ID')
const clientEmail = requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL')
const rawPrivateKey = requireEnv('GOOGLE_PRIVATE_KEY')

if (!spreadsheetId || !clientEmail || !rawPrivateKey) {
  await readExistingOrExit()
  process.exit(0)
}

const privateKey = rawPrivateKey.replace(/\\n/g, '\n')
const { google } = await import('googleapis')
const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })

const [vehicleRows, settingsRows] = await Promise.all([
  readSheet(sheets, spreadsheetId, VEHICLES_SHEET_NAME),
  readSheet(sheets, spreadsheetId, SETTINGS_SHEET_NAME),
])

const errors = []
const seenIds = new Set()

const phoneDisplay = readSetting(settingsRows, '상담전화')
const phoneRaw = toDigits(phoneDisplay)
const contactLabel = readSetting(settingsRows, '상담라벨', '상담 전화')

if (!phoneDisplay || !phoneRaw) {
  errors.push(error(SETTINGS_SHEET_NAME, 0, '상담전화', phoneDisplay, 'settings 탭의 상담전화 is required.'))
}

for (const row of vehicleRows) validateVehicleRow(row, seenIds, errors)

const vehicles = vehicleRows
  .filter((row) => toVisible(row['노출여부']))
  .map((row, index) => {
    const id = normalizeValue(row['차량ID'])
    const title = normalizeValue(row['차량명'])
    const sortOrder = toInt(row['정렬순서'], index + 1)
    const { thumbnail, images } = buildImages(row, title, id || `vehicle-${index + 1}`, errors)
    const youtubeId = extractYoutubeId(row['유튜브URL'])

    return {
      id,
      status: 'available',
      title,
      sortOrder,
      thumbnail,
      profile: {
        vehicleType: normalizeValue(row['차종']),
        brand: normalizeValue(row['브랜드']),
        model: normalizeValue(row['모델']),
        year: toInt(row['연식']),
        mileageKm: toInt(row['주행거리']),
        fuel: normalizeValue(row['연료']) || undefined,
        transmission: normalizeValue(row['변속기']) || undefined,
        color: normalizeValue(row['색상']) || undefined,
        shortDescription: normalizeValue(row['짧은설명']),
        detailDescription: withDefault(row['상세설명'], normalizeValue(row['짧은설명'])),
      },
      images,
      video: youtubeId
        ? {
            youtubeId,
            title: `${title} 소개 영상`,
          }
        : undefined,
      contact: phoneRaw
        ? {
            label: contactLabel,
            phoneDisplay,
            phoneRaw,
          }
        : undefined,
    }
  })
  .sort((a, b) => a.sortOrder - b.sortOrder)

await writeReport(errors)
if (errors.length > 0) {
  console.error(`[sync] ${errors.length} blocking error(s). See public/data/vehicle-catalog.errors.json`)
  process.exit(1)
}

const catalog = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  vehicles,
}

await mkdir(path.dirname(catalogPath), { recursive: true })
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
console.log(`[sync] wrote ${vehicles.length} visible vehicle(s) from ${VEHICLES_SHEET_NAME}/${SETTINGS_SHEET_NAME} to public/data/vehicle-catalog.json`)
