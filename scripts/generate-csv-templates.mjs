/**
 * Creates CSV import templates with example rows per certification.
 * Run: node scripts/generate-csv-templates.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLUEPRINTS_DIR = join(__dirname, "../packages/database/content/blueprints");
const TEMPLATES_DIR = join(__dirname, "../packages/database/content/templates");

const header =
  "certification_slug,domain_slug,objective_id,title,description,option_a,option_b,option_c,option_d,correct_option,difficulty,tags,explanation,reference_urls";

mkdirSync(TEMPLATES_DIR, { recursive: true });

const slugCheat = ["# Certification & domain slugs", "certification_slug,domain_slug,objective_id"];

for (const file of readdirSync(BLUEPRINTS_DIR).filter((f) => f.endsWith(".json"))) {
  const bp = JSON.parse(readFileSync(join(BLUEPRINTS_DIR, file), "utf-8"));
  const d0 = bp.domains[0];
  const o0 = d0?.objectives?.[0];
  const refs = (bp.referenceUrls ?? []).join("|");

  const example1 = [
    bp.slug,
    d0.slug,
    o0?.id ?? "OBJ-1",
    `Example: ${bp.examCode} scenario for ${o0?.description?.slice(0, 40) ?? d0.name}`,
    `Your team needs to address: ${o0?.description ?? d0.name}. What is the best approach?`,
    "Correct answer aligned with official exam guide",
    "Plausible distractor that violates best practice",
    "Another incorrect option",
    "Option that applies wrong domain controls",
    "A",
    "MEDIUM",
    `${bp.slug}|${d0.slug}|${o0?.id ?? "OBJ-1"}|reviewed`,
    `Option A is correct because it follows ${bp.provider} guidance for this objective.`,
    refs,
  ]
    .map((v) => (String(v).includes(",") ? `"${String(v).replace(/"/g, '""')}"` : v))
    .join(",");

  const d1 = bp.domains[1] ?? d0;
  const o1 = d1.objectives?.[0] ?? o0;
  const example2 = [
    bp.slug,
    d1.slug,
    o1?.id ?? "OBJ-2",
    `Example 2: ${bp.examCode} — ${o1?.id ?? "objective"}`,
    `Which solution best satisfies: ${o1?.description ?? d1.name}?`,
    "Incorrect: ignores security baseline",
    "Correct per vendor documentation",
    "Incorrect: over-provisioned and costly",
    "Incorrect: not supported in exam scope",
    "B",
    "HARD",
    `${bp.slug}|${d1.slug}|${o1?.id ?? "OBJ-2"}|reviewed`,
    "Option B matches the official skills outline for this objective.",
    refs,
  ]
    .map((v) => (String(v).includes(",") ? `"${String(v).replace(/"/g, '""')}"` : v))
    .join(",");

  writeFileSync(join(TEMPLATES_DIR, `${bp.slug}.csv`), [header, example1, example2].join("\n"));

  slugCheat.push(`# ${bp.name}`);
  for (const d of bp.domains) {
    for (const o of d.objectives ?? []) {
      slugCheat.push(`${bp.slug},${d.slug},${o.id}`);
    }
  }
  slugCheat.push("");
}

writeFileSync(join(TEMPLATES_DIR, "slug-cheat-sheet.csv"), slugCheat.join("\n"));
console.log(`Templates written to ${TEMPLATES_DIR}`);
