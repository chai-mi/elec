import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "migrations",
  schema: "./workers/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
});
