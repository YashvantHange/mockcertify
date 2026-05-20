import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { CertificationBlueprint } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getBlueprintsDir(): string {
  return join(__dirname, "blueprints");
}

export function loadBlueprint(slug: string): CertificationBlueprint | null {
  const path = join(getBlueprintsDir(), `${slug}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as CertificationBlueprint;
}

export function loadAllBlueprints(): CertificationBlueprint[] {
  const { readdirSync } = require("fs") as typeof import("fs");
  const dir = getBlueprintsDir();
  return readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .map((f: string) => JSON.parse(readFileSync(join(dir, f), "utf-8")) as CertificationBlueprint);
}

export function getDomainsFromBlueprint(slug: string): {
  name: string;
  slug: string;
  weightPercent: number;
}[] {
  const bp = loadBlueprint(slug);
  if (!bp) return [];
  return bp.domains.map((d) => ({
    name: d.name,
    slug: d.slug,
    weightPercent: d.weightPercent,
  }));
}
