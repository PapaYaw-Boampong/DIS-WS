import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { env } from "../env";

// Cloudflare R2 is S3-compatible: the AWS SDK works unchanged against R2's
// endpoint. This is the only module that touches storage credentials — every
// route goes through the functions below instead of the client directly.
const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

// Returns null if the object doesn't exist (mirrors a 404, not a throw).
export async function getObjectBytes(key: string): Promise<Buffer | null> {
  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    );
    if (!result.Body) return null;
    const chunks: Buffer[] = [];
    for await (const chunk of result.Body as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    if (
      error instanceof Error &&
      "name" in error &&
      (error.name === "NoSuchKey" || error.name === "NotFound")
    ) {
      return null;
    }
    throw error;
  }
}
