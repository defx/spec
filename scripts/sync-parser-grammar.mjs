import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  ["grammar/spec.ebnf", "packages/parser/grammar/spec.ebnf"],
  ["grammar/grammar.json", "packages/parser/grammar/grammar.json"]
];

for (const [source, destination] of files) {
  const sourcePath = resolve(repoRoot, source);
  const destinationPath = resolve(repoRoot, destination);
  await mkdir(dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
  console.log(`${source} -> ${destination}`);
}
