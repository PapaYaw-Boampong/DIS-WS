import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(4000),
  ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Cloudflare R2 (S3-compatible) private object storage. Required — file
  // uploads (payment attachments today; course materials/receipts later)
  // have no other storage backend.
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins = env.ALLOWED_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
