import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  API_PREFIX: z.string().default("/api/v1"),
  VERCEL_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  VERCEL_REGION: z.string().optional(),

  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default("0"),

  JWT_SECRET: z.string().default("default-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  JWT_REFRESH_SECRET: z.string().default("default-refresh-secret"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),

  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_DIR: z.string().default("./logs"),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      const zodError = error as z.ZodError;
      zodError.issues.forEach((issue: z.ZodIssue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
