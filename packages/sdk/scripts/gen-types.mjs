// Regenerates src/generated/lium.ts from Lium's live OpenAPI 3.1 spec.
// Lium is the source of truth: run this whenever the API changes.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const SPEC_URL = process.env.LIUM_OPENAPI_URL ?? "https://lium.io/api/openapi.json";
const root = new URL("..", import.meta.url);

const res = await fetch(SPEC_URL);
if (!res.ok) throw new Error(`Fetching ${SPEC_URL} failed: ${res.status}`);
const spec = await res.json();

const ast = await openapiTS(spec, { alphabetize: true });
const header =
  `// Generated from ${SPEC_URL} (Lium Backend API ${spec.info?.version ?? ""}).\n` +
  `// Do not edit by hand: run \`pnpm gen:types\`.\n\n`;

await writeFile(fileURLToPath(new URL("src/generated/lium.ts", root)), header + astToString(ast));
await writeFile(fileURLToPath(new URL("openapi.json", root)), JSON.stringify(spec, null, 2) + "\n");
console.log(`Generated types for ${Object.keys(spec.paths).length} Lium API paths.`);
