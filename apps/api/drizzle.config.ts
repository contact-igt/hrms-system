import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const apiRoot = dirname(fileURLToPath(import.meta.url));
const portablePath = (value: string) => value.replaceAll("\\", "/");
config({ path: resolve(apiRoot, ".env"), quiet: true });

export default defineConfig({
  dialect: "mysql",
  schema: portablePath(resolve(apiRoot, "src/database/schema/index.ts")),
  out: portablePath(resolve(apiRoot, "drizzle")),
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "mysql://hrms_user:password@127.0.0.1:3306/hrms",
  },
  verbose: true,
  strict: true,
});
