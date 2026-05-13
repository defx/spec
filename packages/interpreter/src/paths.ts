import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const defaultSchemaPath = resolve(packageRoot, "schemas/interpretation.schema.json");
