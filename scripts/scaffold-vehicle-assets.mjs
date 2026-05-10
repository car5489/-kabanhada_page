import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const publicVehiclesDir = path.join(root, 'public', 'vehicles')
const defaultCatalogPath = path.join(root, 'public', 'data', 'vehicle-catalog.json')

const requiredImageFiles = [
  { name: 'main.jpg', label: '대표사진 / 카드 썸네일' },
  { name: '01.jpg', label: '상세 갤러리 1번' },
  { name: '02.jpg', label: '상세 갤러리 2번' },
  { name: '03.jpg', label: '상세 갤러리 3번' },
]

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue

    const inline = token.match(/^--([^=]+)=(.*)$/)
    if (inline) {
      args[inline[1]] = inline[2]
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = next
    index += 1
  }
  return args
}

function assertVehicleId(id) {
  if (!id) throw new Error('차량ID is required. Use --id avante-cn7-2022')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid 차량ID: ${id}. Use lowercase letters, numbers, and hyphens only.`)
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeIfMissing(filePath, content) {
  if (await exists(filePath)) return false
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
  return true
}

function vehicleReadme(id, title) {
  return `# ${title || id} 이미지 폴더\n\n이 폴더는 카반하다 차량 카탈로그의 \`${id}\` 차량 이미지 원본 위치입니다.\n\n## 필요한 파일명\n\n| 파일명 | 용도 | 권장 사이즈 |\n|---|---|---|\n| \`main.jpg\` | 대표사진 / 카드 썸네일 | 1600 x 1067px |\n| \`01.jpg\` | 상세 갤러리 1번 | 1600 x 1067px |\n| \`02.jpg\` | 상세 갤러리 2번 | 1600 x 1067px |\n| \`03.jpg\` | 상세 갤러리 3번 | 1600 x 1067px |\n\n## Google Sheet 입력 경로\n\n\`\`\`txt\n대표사진: /vehicles/${id}/main.jpg\n사진1: /vehicles/${id}/01.jpg\n사진2: /vehicles/${id}/02.jpg\n사진3: /vehicles/${id}/03.jpg\n\`\`\`\n\n## 주의\n\n- 이미지 파일은 이 안내 파일을 지우지 않고 같은 폴더에 넣으면 됩니다.\n- 파일명은 위 기준 그대로 사용합니다.\n- 빌드 시 JPG/PNG 원본은 WebP로 자동 최적화됩니다.\n- \`차량ID\`는 Google Sheet의 차량ID와 이 폴더명이 반드시 같아야 합니다.\n`
}

function placeholderText(id, file) {
  return `${file.name}\n\n용도: ${file.label}\n차량ID: ${id}\n권장 사이즈: 1600 x 1067px\n권장 비율: 3:2\n\n실제 이미지 파일을 같은 이름의 JPG로 넣어주세요.\n이 placeholder txt 파일은 안내용이며 사이트에는 사용되지 않습니다.\n`
}

async function scaffoldVehicle({ id, title = '' }) {
  assertVehicleId(id)

  const vehicleDir = path.join(publicVehiclesDir, id)
  await fs.mkdir(vehicleDir, { recursive: true })

  const written = []
  const skipped = []

  const readmePath = path.join(vehicleDir, 'README.md')
  if (await writeIfMissing(readmePath, vehicleReadme(id, title))) written.push(path.relative(root, readmePath))
  else skipped.push(path.relative(root, readmePath))

  const gitkeepPath = path.join(vehicleDir, '.gitkeep')
  if (await writeIfMissing(gitkeepPath, '')) written.push(path.relative(root, gitkeepPath))
  else skipped.push(path.relative(root, gitkeepPath))

  for (const file of requiredImageFiles) {
    const imagePath = path.join(vehicleDir, file.name)
    const placeholderPath = path.join(vehicleDir, `${file.name}.placeholder.txt`)

    if (await exists(imagePath)) {
      skipped.push(path.relative(root, imagePath))
      continue
    }

    if (await writeIfMissing(placeholderPath, placeholderText(id, file))) {
      written.push(path.relative(root, placeholderPath))
    } else {
      skipped.push(path.relative(root, placeholderPath))
    }
  }

  return { id, title, dir: path.relative(root, vehicleDir), written, skipped }
}

async function vehiclesFromCatalog(catalogPath) {
  const raw = await fs.readFile(catalogPath, 'utf8')
  const catalog = JSON.parse(raw)
  return (catalog.vehicles ?? [])
    .map((vehicle) => ({ id: vehicle.id, title: vehicle.title }))
    .filter((vehicle) => vehicle.id)
}

function printUsage() {
  console.log(`Usage:\n\n  npm run scaffold:vehicle -- --id avante-cn7-2022 --title "2022 현대 아반떼 CN7"\n  npm run scaffold:vehicles\n  npm run scaffold:vehicles -- --catalog public/data/vehicle-catalog.json\n\nCreates:\n  public/vehicles/<차량ID>/README.md\n  public/vehicles/<차량ID>/.gitkeep\n  public/vehicles/<차량ID>/main.jpg.placeholder.txt\n  public/vehicles/<차량ID>/01.jpg.placeholder.txt\n  public/vehicles/<차량ID>/02.jpg.placeholder.txt\n  public/vehicles/<차량ID>/03.jpg.placeholder.txt\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || args.h) {
    printUsage()
    return
  }

  let targets = []

  if (args.id) {
    targets = [{ id: String(args.id), title: args.title ? String(args.title) : String(args.id) }]
  } else {
    const catalogPath = path.resolve(root, args.catalog ? String(args.catalog) : defaultCatalogPath)
    targets = await vehiclesFromCatalog(catalogPath)
  }

  if (targets.length === 0) {
    console.log('[scaffold] No vehicles found.')
    return
  }

  const results = []
  for (const target of targets) {
    results.push(await scaffoldVehicle(target))
  }

  for (const result of results) {
    console.log(`[scaffold] ${result.id} -> ${result.dir}`)
    if (result.written.length > 0) {
      console.log(`  created: ${result.written.length}`)
      for (const file of result.written) console.log(`    + ${file}`)
    }
    if (result.skipped.length > 0) console.log(`  skipped existing: ${result.skipped.length}`)
  }

  console.log(`[scaffold] ready: ${results.length} vehicle folder(s) checked.`)
}

main().catch((error) => {
  console.error('[scaffold] failed')
  console.error(error?.message ?? error)
  process.exit(1)
})
