import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const VEHICLES_DIR = path.resolve('public', 'vehicles');

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 1067;

const IMAGE_SLOTS = [
  'main',
  '01',
  '02',
  '03',
];

const INPUT_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listVehicleDirectories(rootDir) {
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !name.startsWith('.'))
      .sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );
  } catch {
    return [];
  }
}

async function findInputImage(vehicleDir, slotName) {
  for (const extension of INPUT_EXTENSIONS) {
    const candidate = path.join(vehicleDir, `${slotName}${extension}`);

    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return '';
}

async function optimizeImage(inputPath, outputPath) {
  const tempPath = `${outputPath}.tmp`;

  await sharp(inputPath)
    .rotate()
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: false,
    })
    .jpeg({
      quality: 86,
      mozjpeg: true,
      progressive: true,
    })
    .toFile(tempPath);

  await fs.rename(tempPath, outputPath);
}

async function optimizeVehicleImages(vehicleId) {
  const vehicleDir = path.join(VEHICLES_DIR, vehicleId);

  let optimizedCount = 0;
  let skippedCount = 0;

  for (const slotName of IMAGE_SLOTS) {
    const inputPath = await findInputImage(vehicleDir, slotName);

    if (!inputPath) {
      skippedCount += 1;
      continue;
    }

    const outputPath = path.join(vehicleDir, `${slotName}.jpg`);

    await optimizeImage(inputPath, outputPath);

    optimizedCount += 1;
  }

  return {
    vehicleId,
    optimizedCount,
    skippedCount,
  };
}

async function main() {
  const vehicleIds = await listVehicleDirectories(VEHICLES_DIR);

  let totalOptimized = 0;
  let totalSkipped = 0;

  console.log(`[images] target size: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  console.log(`[images] vehicles dir: ${VEHICLES_DIR}`);

  if (vehicleIds.length === 0) {
    console.log('[images] no vehicle folders found');
    return;
  }

  for (const vehicleId of vehicleIds) {
    const result = await optimizeVehicleImages(vehicleId);

    totalOptimized += result.optimizedCount;
    totalSkipped += result.skippedCount;

    console.log(
      `[images] ${result.vehicleId}: optimized ${result.optimizedCount}, skipped ${result.skippedCount}`
    );
  }

  console.log(`[images] done: optimized ${totalOptimized}, skipped ${totalSkipped}`);
}

main().catch((error) => {
  console.error('[images] optimize failed');
  console.error(error);
  process.exit(1);
});
