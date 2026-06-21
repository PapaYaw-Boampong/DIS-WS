import { createHash } from "node:crypto";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

import {
  EXPECTED_IMAGE_COUNT,
  highlightSources,
  imageAlbums,
  imageManifest,
  siteImageAliases,
} from "./image-manifest.mjs";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "pics");
const outputRoot = path.join(
  projectRoot,
  "src",
  "assets",
  "images",
  "approved",
);
const registryPath = path.join(projectRoot, "src", "lib", "images.generated.ts");
const generatedManifestName = "manifest.json";

const profiles = {
  hero: { maxDimension: 2560, sourceQuality: 90, deliveryQuality: 86 },
  gallery: { maxDimension: 1920, sourceQuality: 88, deliveryQuality: 82 },
  card: { maxDimension: 1600, sourceQuality: 86, deliveryQuality: 82 },
};

function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function removePath(targetPath) {
  await rm(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 8,
    retryDelay: 250,
  });
}

async function hashFile(filePath) {
  return hashBuffer(await readFile(filePath));
}

function sourcePath(source) {
  return path.join(sourceRoot, ...source.split("/"));
}

function outputName(entry) {
  return `${entry.id}.webp`;
}

function assertManifest() {
  if (imageManifest.length !== EXPECTED_IMAGE_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_IMAGE_COUNT} images, found ${imageManifest.length}.`,
    );
  }

  const ids = new Set();
  const sources = new Set();

  for (const entry of imageManifest) {
    if (!entry.approved) {
      throw new Error(`Image is not approved: ${entry.source}`);
    }

    if (ids.has(entry.id)) {
      throw new Error(`Duplicate image id: ${entry.id}`);
    }

    if (sources.has(entry.source)) {
      throw new Error(`Duplicate source path: ${entry.source}`);
    }

    if (!profiles[entry.profile]) {
      throw new Error(`Unknown profile for ${entry.source}: ${entry.profile}`);
    }

    if (!imageAlbums.some((album) => album.id === entry.album)) {
      throw new Error(`Unknown album for ${entry.source}: ${entry.album}`);
    }

    if (!entry.alt.trim() || !entry.title.trim()) {
      throw new Error(`Missing title or alt text for ${entry.source}`);
    }

    ids.add(entry.id);
    sources.add(entry.source);
  }

  for (const [alias, source] of Object.entries(siteImageAliases)) {
    if (!sources.has(source)) {
      throw new Error(`Alias ${alias} references an unknown source: ${source}`);
    }
  }

  for (const source of highlightSources) {
    if (!sources.has(source)) {
      throw new Error(`Highlight references an unknown source: ${source}`);
    }
  }
}

async function verifySources() {
  const sourceHashes = new Map();

  for (const entry of imageManifest) {
    const filePath = sourcePath(entry.source);
    let fileStat;

    try {
      fileStat = await stat(filePath);
    } catch {
      throw new Error(`Missing source image: ${entry.source}`);
    }

    if (!fileStat.isFile()) {
      throw new Error(`Source is not a file: ${entry.source}`);
    }

    const sourceHash = await hashFile(filePath);
    const duplicates = sourceHashes.get(sourceHash) ?? [];
    duplicates.push(entry.source);
    sourceHashes.set(sourceHash, duplicates);
  }

  const exactDuplicates = [...sourceHashes.entries()]
    .filter(([, sources]) => sources.length > 1)
    .map(([hash, sources]) => ({ hash, sources }));

  return exactDuplicates;
}

async function processEntry(entry, destinationRoot) {
  const profile = profiles[entry.profile];
  const inputPath = sourcePath(entry.source);
  const outputPath = path.join(destinationRoot, outputName(entry));
  const inputStat = await stat(inputPath);
  const sourceHash = await hashFile(inputPath);

  await sharp(inputPath)
    .rotate()
    .toColourspace("srgb")
    .resize({
      width: profile.maxDimension,
      height: profile.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: profile.sourceQuality,
      effort: 6,
      preset: "photo",
      smartSubsample: true,
    })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const outputStat = await stat(outputPath);
  const outputHash = await hashFile(outputPath);
  const hasSensitiveMetadata = Boolean(
    metadata.exif || metadata.gps || metadata.xmp || metadata.iptc,
  );

  if (metadata.format !== "webp") {
    throw new Error(`Unexpected output format for ${entry.source}`);
  }

  if (!metadata.width || !metadata.height) {
    throw new Error(`Missing output dimensions for ${entry.source}`);
  }

  if (
    metadata.width > profile.maxDimension ||
    metadata.height > profile.maxDimension
  ) {
    throw new Error(`Output exceeds profile dimensions: ${entry.source}`);
  }

  if (hasSensitiveMetadata) {
    throw new Error(`Metadata was not stripped from ${entry.source}`);
  }

  return {
    ...entry,
    output: outputName(entry),
    sourceBytes: inputStat.size,
    outputBytes: outputStat.size,
    width: metadata.width,
    height: metadata.height,
    sourceHash,
    outputHash,
    sourceQuality: profile.sourceQuality,
    deliveryQuality: profile.deliveryQuality,
  };
}

async function runPool(entries, workerCount, worker) {
  const results = new Array(entries.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < entries.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(entries[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(workerCount, entries.length) },
      runWorker,
    ),
  );

  return results;
}

function registrySource(records, manifestHash) {
  const imports = records
    .map(
      (record, index) =>
        `import image${index} from "@/assets/images/approved/${record.output}";`,
    )
    .join("\n");

  const images = records
    .map(
      (record, index) => `  ${JSON.stringify(record.id)}: {
    src: image${index},
    id: ${JSON.stringify(record.id)},
    alt: ${JSON.stringify(record.alt)},
    title: ${JSON.stringify(record.title)},
    caption: ${JSON.stringify(record.caption)},
    album: ${JSON.stringify(record.album)},
    position: ${JSON.stringify(record.position)},
    fit: ${JSON.stringify(record.fit)},
    profile: ${JSON.stringify(record.profile)},
    quality: ${record.deliveryQuality},
  },`,
    )
    .join("\n");

  const sourceToId = new Map(records.map((record) => [record.source, record.id]));
  const aliases = Object.entries(siteImageAliases)
    .map(
      ([alias, source]) =>
        `  ${alias}: imageById[${JSON.stringify(sourceToId.get(source))}],`,
    )
    .join("\n");
  const gallery = records
    .map((record) => `  imageById[${JSON.stringify(record.id)}],`)
    .join("\n");
  const highlights = highlightSources
    .map(
      (source) => `  imageById[${JSON.stringify(sourceToId.get(source))}],`,
    )
    .join("\n");

  return `/* This file is generated by scripts/image-pipeline.mjs. */
${imports}
import type { GalleryAlbum, SiteImage } from "@/types/content";

export const generatedImageManifestHash = ${JSON.stringify(manifestHash)};

export const galleryAlbums = ${JSON.stringify(imageAlbums, null, 2)} as const satisfies readonly GalleryAlbum[];

export const imageById = {
${images}
} satisfies Record<string, SiteImage>;

export const siteImages = {
${aliases}
} as const;

export const galleryImages = [
${gallery}
] as const;

export const galleryHighlights = [
${highlights}
] as const;
`;
}

async function prepare() {
  assertManifest();
  const duplicates = await verifySources();
  const tempRoot = path.join(
    tmpdir(),
    `dis-approved-images-${process.pid}`,
  );
  const backupRoot = `${outputRoot}.backup-${process.pid}`;
  const tempRegistry = path.join(
    tmpdir(),
    `dis-images-generated-${process.pid}.ts`,
  );

  await removePath(tempRoot);
  await removePath(backupRoot);
  await mkdir(tempRoot, { recursive: true });

  console.log(`Preparing ${imageManifest.length} approved images...`);
  const records = await runPool(imageManifest, 4, async (entry, index) => {
    const record = await processEntry(entry, tempRoot);
    console.log(
      `[${index + 1}/${imageManifest.length}] ${entry.source} -> ${record.output}`,
    );
    return record;
  });

  const manifestHash = hashBuffer(
    Buffer.from(
      JSON.stringify({
        albums: imageAlbums,
        aliases: siteImageAliases,
        highlights: highlightSources,
        images: imageManifest,
      }),
    ),
  );
  const generatedManifest = {
    version: 1,
    manifestHash,
    generatedAt: new Date().toISOString(),
    imageCount: records.length,
    exactSourceDuplicates: duplicates,
    records,
  };

  await writeFile(
    path.join(tempRoot, generatedManifestName),
    `${JSON.stringify(generatedManifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    tempRegistry,
    registrySource(records, manifestHash),
    "utf8",
  );

  let movedExistingOutput = false;
  let copiedNewOutput = false;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    try {
      await rename(outputRoot, backupRoot);
      movedExistingOutput = true;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    await mkdir(outputRoot, { recursive: true });
    await cp(tempRoot, outputRoot, { recursive: true, force: true });
    copiedNewOutput = true;
    await copyFile(tempRegistry, registryPath);
  } catch (error) {
    if (copiedNewOutput) {
      await removePath(outputRoot);
    }

    if (movedExistingOutput) {
      await rename(backupRoot, outputRoot);
    }

    try {
      await removePath(tempRoot);
      await removePath(tempRegistry);
    } catch {
      // Preserve the original replacement error.
    }

    throw error;
  }

  for (const cleanupTarget of [backupRoot, tempRoot, tempRegistry]) {
    try {
      await removePath(cleanupTarget);
    } catch (error) {
      console.warn(
        `Cleanup deferred for ${path.basename(cleanupTarget)}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  reportFromManifest(generatedManifest);
}

async function readGeneratedManifest() {
  const manifestPath = path.join(outputRoot, generatedManifestName);

  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    throw new Error(
      "Generated image manifest is missing. Run npm run images:prepare.",
    );
  }
}

async function verify() {
  assertManifest();
  const sourceDuplicates = await verifySources();
  const generated = await readGeneratedManifest();

  if (generated.imageCount !== imageManifest.length) {
    throw new Error(
      `Generated image count is ${generated.imageCount}; expected ${imageManifest.length}.`,
    );
  }

  const expectedManifestHash = hashBuffer(
    Buffer.from(
      JSON.stringify({
        albums: imageAlbums,
        aliases: siteImageAliases,
        highlights: highlightSources,
        images: imageManifest,
      }),
    ),
  );

  if (generated.manifestHash !== expectedManifestHash) {
    throw new Error(
      "Generated images are stale. Run npm run images:prepare.",
    );
  }

  const expectedOutputs = new Set([
    generatedManifestName,
    ...imageManifest.map(outputName),
  ]);
  const actualOutputs = new Set(await readdir(outputRoot));
  const unexpectedOutputs = [...actualOutputs].filter(
    (output) => !expectedOutputs.has(output),
  );
  const missingOutputs = [...expectedOutputs].filter(
    (output) => !actualOutputs.has(output),
  );

  if (unexpectedOutputs.length || missingOutputs.length) {
    throw new Error(
      `Generated output mismatch. Missing: ${missingOutputs.join(", ") || "none"}. Unexpected: ${unexpectedOutputs.join(", ") || "none"}.`,
    );
  }

  const generatedBySource = new Map(
    generated.records.map((record) => [record.source, record]),
  );

  for (const entry of imageManifest) {
    const record = generatedBySource.get(entry.source);

    if (!record) {
      throw new Error(`Missing generated record for ${entry.source}`);
    }

    const currentSourceHash = await hashFile(sourcePath(entry.source));
    if (currentSourceHash !== record.sourceHash) {
      throw new Error(
        `Source changed after generation: ${entry.source}. Run npm run images:prepare.`,
      );
    }

    const generatedPath = path.join(outputRoot, record.output);
    const currentOutputHash = await hashFile(generatedPath);
    if (currentOutputHash !== record.outputHash) {
      throw new Error(`Generated image was modified: ${record.output}`);
    }

    const metadata = await sharp(generatedPath).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.exif ||
      metadata.gps ||
      metadata.xmp ||
      metadata.iptc
    ) {
      throw new Error(`Invalid generated image: ${record.output}`);
    }
  }

  const registry = await readFile(registryPath, "utf8");
  if (!registry.includes(expectedManifestHash)) {
    throw new Error(
      "Generated TypeScript registry is stale. Run npm run images:prepare.",
    );
  }

  console.log(
    `Verified ${imageManifest.length} WebP images across ${imageAlbums.length} albums.`,
  );

  if (sourceDuplicates.length) {
    console.warn(
      `Detected ${sourceDuplicates.length} exact source duplicate group(s).`,
    );
  }
}

function reportFromManifest(generated) {
  const sourceBytes = generated.records.reduce(
    (total, record) => total + record.sourceBytes,
    0,
  );
  const outputBytes = generated.records.reduce(
    (total, record) => total + record.outputBytes,
    0,
  );
  const savings = sourceBytes
    ? ((sourceBytes - outputBytes) / sourceBytes) * 100
    : 0;

  console.log(
    `Source: ${(sourceBytes / 1024 / 1024).toFixed(2)} MB | WebP: ${(outputBytes / 1024 / 1024).toFixed(2)} MB | Saved: ${savings.toFixed(1)}%`,
  );

  if (savings < 30) {
    console.warn("Compression savings are below the 30% target.");
  }

  const oversized = generated.records.filter(
    (record) => record.outputBytes > 1024 * 1024,
  );
  if (oversized.length) {
    console.warn(
      `Oversized generated images: ${oversized.map((record) => record.output).join(", ")}`,
    );
  }
}

async function report() {
  reportFromManifest(await readGeneratedManifest());
}

const command = process.argv[2] ?? "prepare";

try {
  if (command === "prepare") {
    await prepare();
  } else if (command === "verify") {
    await verify();
  } else if (command === "report") {
    await report();
  } else {
    throw new Error(`Unknown image pipeline command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
