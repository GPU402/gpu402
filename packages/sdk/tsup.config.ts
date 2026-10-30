import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", openapi: "src/openapi.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  external: ["ssh2"],
});
