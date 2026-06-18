import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "pics");
const outputRoot = path.join(projectRoot, "src", "assets", "images", "approved");

const approvedAssets = [
  ["events/graduation/group/group pic - celebrating.jpeg", "home-hero.jpg"],
  ["academics/Elearners/kids circle.jpeg", "home-welcome.jpg"],
  ["history/students/year group 2024.jpeg", "about-community.jpg"],
  ["history/students/dis- start.jpeg", "history-origin.jpg"],
  ["academics/jhs/Sci 5.jpeg", "academics-overview.jpg"],
  ["academics/Elearners/kids playing.jpeg", "early-years.jpg"],
  ["academics/jhs/Sci 1.jpeg", "junior-high.jpg"],
  ["academics/jhs/Sci 3.jpeg", "science-gallery.jpg"],
  [
    "events/graduation/group/early learners walk up.jpg",
    "student-life-hero.jpg",
  ],
  [
    "events/graduation/close ups/Student Speaking.jpg",
    "student-confidence.jpg",
  ],
  ["events/graduation/awards/a1.jpg", "achievement.jpg"],
  ["events/graduation/awards/a8.jpg", "award-gallery.jpg"],
  ["events/graduation/dance/dancing 1.jpg", "dance.jpg"],
  ["events/graduation/play/s1.jpg", "cultural-play.jpg"],
  ["events/graduation/recital/stage 8.jpg", "recital.jpg"],
  [
    "events/graduation/group/group pic - standard.jpeg",
    "graduation.jpg",
  ],
  ["events/graduation/models/m1.jpg", "creative-confidence.jpg"],
  [
    "academics/Elearners/kids playing 2.jpeg",
    "early-learning-gallery.jpg",
  ],
  ["academics/jhs/Sci 2.jpeg", "academics-hero.jpg"],
  ["academics/jhs/Sci 4.jpeg", "junior-high-hero.jpg"],
  ["events/graduation/group/g2.jpg", "about-hero.jpg"],
  ["history/students/year group 2022.jpeg", "history-hero.jpg"],
  [
    "events/graduation/group/student walk up.jpg",
    "admissions-hero.jpg",
  ],
  ["events/graduation/group/g1.jpg", "news-hero.jpg"],
  [
    "events/graduation/group/kg walk up - close up.jpg",
    "school-reopens.jpg",
  ],
  [
    "events/graduation/awards/a10.jpg",
    "family-progress-meetings.jpg",
  ],
  ["events/graduation/play/p3.jpg", "co-curricular-showcase.jpg"],
  [
    "events/graduation/group/group pic- Elearners - standard.jpeg",
    "admissions-enquiries.jpg",
  ],
  ["events/graduation/awards/a4.jpg", "end-of-term-event.jpg"],
  ["events/graduation/dance/dance2.jpg", "calendar-showcase.jpg"],
  [
    "events/graduation/recital/Student Speaking2.jpg",
    "gallery-student-speaker.jpg",
  ],
  ["events/graduation/models/m10.jpg", "gallery-fashion.jpg"],
  ["events/graduation/recital/stage 2.jpg", "gallery-recital.jpg"],
  ["events/graduation/play/p4.jpg", "gallery-cultural-play.jpg"],
  ["events/graduation/awards/a13.jpg", "gallery-award.jpg"],
  ["events/graduation/close ups/s1.jpg", "gallery-graduate.jpg"],
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const [source, output] of approvedAssets) {
  const sourcePath = path.join(sourceRoot, ...source.split("/"));
  const outputPath = path.join(outputRoot, output);

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 88,
      progressive: true,
    })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const hasSensitiveMetadata = Boolean(
    metadata.exif || metadata.gps || metadata.xmp || metadata.iptc,
  );

  if (hasSensitiveMetadata) {
    throw new Error(`Metadata was not stripped from ${output}`);
  }

  console.log(
    `${output}: ${metadata.width}x${metadata.height}, metadata stripped`,
  );
}

console.log(`Prepared ${approvedAssets.length} approved images.`);
