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
  // Paystack — an OPTIONAL second payment lane. These are deliberately not
  // required: making them required would fail every existing deployment on
  // boot (env parsing below is fatal). The MoMo-reference and bank-deposit
  // lanes work with all of this absent.
  PAYSTACK_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  // Paystack signs webhooks with HMAC-SHA512 keyed on the SECRET key itself,
  // so there is no separate webhook secret to configure.
  PAYSTACK_SECRET_KEY: z.string().optional(),
  // Where Paystack returns the parent after checkout. Points at the portal's
  // confirm page, not the backend.
  PAYSTACK_CALLBACK_URL: z.string().optional(),
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

// Turning Paystack on without a key would show parents a checkout button that
// 500s, and running a test key in production would take real money nowhere.
// Both are refused at boot rather than at the first payment.
if (env.PAYSTACK_ENABLED) {
  if (!env.PAYSTACK_SECRET_KEY) {
    console.error(
      "PAYSTACK_ENABLED=true but PAYSTACK_SECRET_KEY is missing. Refusing to start.",
    );
    process.exit(1);
  }
  if (
    env.NODE_ENV === "production" &&
    env.PAYSTACK_SECRET_KEY.startsWith("sk_test_")
  ) {
    console.error(
      "PAYSTACK_SECRET_KEY is a test key but NODE_ENV=production. Refusing to start.",
    );
    process.exit(1);
  }
}

export const paystackEnabled = Boolean(
  env.PAYSTACK_ENABLED && env.PAYSTACK_SECRET_KEY,
);

// Which key mode is live, for the readiness screen. Never exposes the key.
export const paystackKeyMode: "test" | "live" | "none" =
  !env.PAYSTACK_SECRET_KEY
    ? "none"
    : env.PAYSTACK_SECRET_KEY.startsWith("sk_test_")
      ? "test"
      : "live";
