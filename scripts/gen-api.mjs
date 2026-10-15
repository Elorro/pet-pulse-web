import { writeFile } from "node:fs/promises";
import { astToString, default as openapiTS } from "openapi-typescript";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
const openapiUrl = new URL("/openapi.json", apiBaseUrl);
const schema = await openapiTS(openapiUrl);
await writeFile("src/lib/api/schema.d.ts", astToString(schema));
console.info(`Generated API types from ${openapiUrl}`);
