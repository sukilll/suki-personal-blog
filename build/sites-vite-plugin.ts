import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const clientDirectory = resolve(root, "dist", "client");
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");

      await mkdir(clientDirectory, { recursive: true });
      await Promise.all([
        cp(resolve(root, "index.html"), resolve(clientDirectory, "index.html")),
        cp(resolve(root, "styles.css"), resolve(clientDirectory, "styles.css")),
        cp(resolve(root, "app.js"), resolve(clientDirectory, "app.js")),
        cp(resolve(root, "assets"), resolve(clientDirectory, "assets"), { recursive: true })
      ]);

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });
      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
    }
  };
}
