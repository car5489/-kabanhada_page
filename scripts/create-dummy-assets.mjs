import { mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeIfMissing(filePath, content) {
  if (await exists(filePath)) return
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

function vehicleSvg(label, variant) {
  const shade = variant === 'thumb' ? '#dcecff' : variant === 'side' ? '#eaf4ff' : '#f4f9ff'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)"/>
  <circle cx="1080" cy="140" r="170" fill="#1d6fd8" opacity="0.12"/>
  <circle cx="180" cy="650" r="210" fill="#1d6fd8" opacity="0.08"/>
  <g transform="translate(215 300)" fill="none" stroke="#1d6fd8" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
    <path d="M80 210h740c44 0 82-28 94-70l26-92c8-29-14-58-44-58H260c-36 0-70 17-92 46L80 150z" fill="#ffffff" opacity="0.78"/>
    <path d="M230 210a74 74 0 1 0 148 0a74 74 0 0 0-148 0" fill="#f7fbff"/>
    <path d="M660 210a74 74 0 1 0 148 0a74 74 0 0 0-148 0" fill="#f7fbff"/>
    <path d="M240 110h480"/>
    <path d="M360 110l46-86h210l80 86"/>
  </g>
  <text x="640" y="690" text-anchor="middle" font-family="Pretendard, Arial, sans-serif" font-size="42" font-weight="800" fill="#0f3f86">${label}</text>
</svg>`
}

function iconSvg(name, pathData) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${pathData}"/>
</svg>`
}

const vehicles = {
  'vehicle-001': '현대 아반떼 CN7',
  'vehicle-002': '기아 쏘렌토',
  'vehicle-003': '기아 카니발',
}
for (const [id, label] of Object.entries(vehicles)) {
  await writeIfMissing(path.join(root, 'public', 'vehicles', id, 'thumbnail.svg'), vehicleSvg(`${label} 대표 이미지`, 'thumb'))
  await writeIfMissing(path.join(root, 'public', 'vehicles', id, 'gallery-01.svg'), vehicleSvg(`${label} 외관 이미지`, 'side'))
  await writeIfMissing(path.join(root, 'public', 'vehicles', id, 'gallery-02.svg'), vehicleSvg(`${label} 상세 이미지`, 'detail'))
}

const icons = {
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18A2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.62a2 2 0 0 1-.45 2.11L9 10.66a16 16 0 0 0 4.34 4.34l1.21-1.21a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.62.6A2 2 0 0 1 22 16.92z',
  mileage: 'M12 14l4-4M4 20a8 8 0 1 1 16 0M12 4v2M4.93 7.93l1.41 1.41M19.07 7.93l-1.41 1.41',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
  fuel: 'M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M4 12h12M16 7h2l2 2v9a2 2 0 0 0 4 0v-5',
  transmission: 'M6 3v18M18 3v18M6 12h12M12 3v6M12 15v6',
  color: 'M12 22a7 7 0 0 0 7-7c0-5-7-13-7-13S5 10 5 15a7 7 0 0 0 7 7z',
  play: 'M8 5v14l11-7z',
  'arrow-left': 'M19 12H5M12 19l-7-7l7-7',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  check: 'M20 6L9 17l-5-5',
}

for (const [name, pathData] of Object.entries(icons)) {
  await writeIfMissing(path.join(root, 'public', 'icons', `${name}.svg`), iconSvg(name, pathData))
}

console.log('[assets] dummy assets are ready')
