// Generates src/lib/api/schema.d.ts from FastAPI's OpenAPI schema.
// Usage: pnpm gen:api [url-or-file]  (defaults to ${API_BASE_URL}/openapi.json)
import { execFileSync } from "node:child_process";

const base = process.env.API_BASE_URL ?? "http://localhost:8000";
const source = process.argv[2] ?? `${base.replace(/\/$/, "")}/openapi.json`;

console.log(`Generating API types from ${source}`);
execFileSync(
  "openapi-typescript",
  [source, "--output", "src/lib/api/schema.d.ts"],
  { stdio: "inherit" },
);
