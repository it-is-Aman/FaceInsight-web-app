import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Read directly (not env()) so `prisma generate` works without a database URL, e.g. during
  // install/build on CI. Commands that need the database (migrate, studio) still fail clearly.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
