import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, "../..");
  const source = path.join(rootDir, "README.md");
  const targetDir = path.join(rootDir, "packages", "client");
  const target = path.join(targetDir, "README.md");

  await mkdir(targetDir, { recursive: true });
  await copyFile(source, target);
}

void main();
