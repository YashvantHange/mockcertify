import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

function resolveRepoRoot(): string {
  const candidates = [
    process.cwd(),
    join(__dirname, "../../../.."),
    join(process.cwd(), ".."),
    join(process.cwd(), "../.."),
  ];
  for (const root of candidates) {
    if (existsSync(join(root, "packages/database/content/blueprints"))) return root;
  }
  return join(__dirname, "../../../..");
}

const REPO_ROOT = resolveRepoRoot();

export interface BlueprintObjective {
  id: string;
  description: string;
}

export interface BlueprintDomain {
  slug: string;
  name: string;
  weightPercent: number;
  objectives: BlueprintObjective[];
}

export interface CertificationBlueprint {
  slug: string;
  examCode: string;
  domains: BlueprintDomain[];
  referenceUrls?: string[];
}

function getBlueprintsDir(): string {
  return join(REPO_ROOT, "packages/database/content/blueprints");
}

export function loadBlueprint(slug: string): CertificationBlueprint | null {
  const path = join(getBlueprintsDir(), `${slug}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as CertificationBlueprint;
}

export function listBlueprintSlugs(): string[] {
  const dir = getBlueprintsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function validateRowAgainstBlueprint(
  row: {
    certification_slug: string;
    domain_slug: string;
    objective_id?: string;
  },
  blueprint: CertificationBlueprint
): string | null {
  const domain = blueprint.domains.find((d) => d.slug === row.domain_slug);
  if (!domain) {
    return `Domain "${row.domain_slug}" not in blueprint for ${blueprint.slug}`;
  }
  if (row.objective_id) {
    const obj = domain.objectives?.find((o) => o.id === row.objective_id);
    if (!obj) {
      return `Objective "${row.objective_id}" not found in domain ${row.domain_slug}`;
    }
  }
  return null;
}
