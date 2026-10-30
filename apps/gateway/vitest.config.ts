import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

// Tests pin SSH host keys in a throwaway directory, never in ~/.lium/known_hosts.
export default defineConfig({
  test: { env: { GPU402_KNOWN_HOSTS_DIR: mkdtempSync(join(tmpdir(), "gpu402-known-hosts-")) } },
});
