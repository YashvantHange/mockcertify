/**
 * Generates syllabus-aligned MCQ CSV files from official blueprint JSON.
 * One file per cert: packages/database/content/generated/<slug>.csv
 *
 * Run: node scripts/generate-blueprint-questions.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLUEPRINTS_DIR = join(ROOT, "packages/database/content/blueprints");
const OUT_DIR = join(ROOT, "packages/database/content/generated");

const TARGET = 500;
const DIFF_MIX = { EASY: 0.3, MEDIUM: 0.4, HARD: 0.3 };

const EASY_STEMS = [
  "Which statement best defines the scope of",
  "What is the primary purpose of",
  "Which concept is fundamental to",
  "Identify the core principle behind",
  "Which description accurately reflects",
];

const MEDIUM_STEMS = [
  "A team must implement a solution for",
  "Which approach aligns with best practices when",
  "During a project review, stakeholders ask how to",
  "Which configuration satisfies requirements for",
  "What is the recommended design when applying",
];

const HARD_STEMS = [
  "An enterprise requires zero-downtime architecture while",
  "Given strict compliance, auditability, and multi-region constraints, how should you",
  "A production incident involves trade-offs between cost and resilience for",
  "Complex regulatory requirements demand that you",
  "A multi-team rollout must balance security and velocity for",
];

const CORRECT_PATTERNS = [
  (obj, domain) =>
    `Apply the official ${domain} guidance: ${obj} — this aligns with exam blueprint expectations and vendor documentation.`,
  (obj) =>
    `Follow the documented approach for ${obj}, using recommended services and controls per the exam guide.`,
  (obj, domain, provider) =>
    `Implement ${obj} using ${provider} best practices for ${domain}, including monitoring and least privilege.`,
];

const WRONG_PATTERNS = [
  () => "Use an approach that contradicts the exam objective and ignores documented constraints.",
  () => "Deploy without monitoring, backup, or access controls required by the blueprint.",
  () => "Mix controls from unrelated domains that do not address the stated objective.",
  () => "Rely on deprecated or unsupported methods excluded from current exam scope.",
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function escapeCsv(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(r) {
  return [
    r.certification_slug,
    r.domain_slug,
    r.objective_id,
    r.title,
    r.description,
    r.option_a,
    r.option_b,
    r.option_c,
    r.option_d,
    r.correct_option,
    r.difficulty,
    r.tags,
    r.explanation,
    r.reference_urls,
  ]
    .map(escapeCsv)
    .join(",");
}

function buildDifficultyPlan(count) {
  const easy = Math.round(count * DIFF_MIX.EASY);
  const medium = Math.round(count * DIFF_MIX.MEDIUM);
  const hard = count - easy - medium;
  const plan = [];
  for (let i = 0; i < easy; i++) plan.push("EASY");
  for (let i = 0; i < medium; i++) plan.push("MEDIUM");
  for (let i = 0; i < hard; i++) plan.push("HARD");
  return plan;
}

function generateQuestion(bp, domain, objective, variant, difficulty) {
  const globalIdx = variant + 1;
  let stem;
  if (difficulty === "EASY") {
    stem = `${pick(EASY_STEMS, globalIdx)} ${objective.description}?`;
  } else if (difficulty === "MEDIUM") {
    stem = `${pick(MEDIUM_STEMS, globalIdx)} ${objective.description} in the context of ${bp.name}?`;
  } else {
    stem = `${pick(HARD_STEMS, globalIdx)} ${objective.description} for ${domain.name}?`;
  }

  const correct = pick(CORRECT_PATTERNS, globalIdx)(objective.description, domain.name, bp.provider);
  const wrongs = WRONG_PATTERNS.map((fn, i) => fn(objective.description, domain.name, i));
  const correctSlot = globalIdx % 4;
  const keys = ["A", "B", "C", "D"];
  const texts = [correct, wrongs[0], wrongs[1], wrongs[2]];
  const rotated = [
    texts[correctSlot],
    texts[(correctSlot + 1) % 4],
    texts[(correctSlot + 2) % 4],
    texts[(correctSlot + 3) % 4],
  ];

  const refs = (bp.referenceUrls ?? []).join("|");
  const tags = [bp.slug, domain.slug, objective.id, difficulty.toLowerCase(), "blueprint-seed"].join("|");

  const title = `${bp.examCode} — ${objective.id} (${difficulty}) #${globalIdx}`;

  return {
    certification_slug: bp.slug,
    domain_slug: domain.slug,
    objective_id: objective.id,
    title,
    description: stem,
    option_a: rotated[0],
    option_b: rotated[1],
    option_c: rotated[2],
    option_d: rotated[3],
    correct_option: keys[correctSlot],
    difficulty,
    tags,
    explanation: `**Answer: ${keys[correctSlot]}** — ${objective.description}. Review the official ${bp.provider} exam guide (${bp.examCode}) and linked documentation. Objective: ${objective.id}.`,
    reference_urls: refs,
  };
}

function distributeByWeight(domains, total) {
  const raw = domains.map((d) => ({
    domain: d,
    exact: (total * d.weightPercent) / 100,
  }));
  const floored = raw.map((r) => ({ ...r, count: Math.floor(r.exact) }));
  let assigned = floored.reduce((s, r) => s + r.count, 0);
  const remainders = floored
    .map((r, i) => ({ i, rem: r.exact - r.count }))
    .sort((a, b) => b.rem - a.rem);
  let ri = 0;
  while (assigned < total) {
    floored[remainders[ri % remainders.length].i].count++;
    assigned++;
    ri++;
  }
  return floored.map((r) => ({ domain: r.domain, count: r.count }));
}

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(BLUEPRINTS_DIR).filter((f) => f.endsWith(".json"));
let grandTotal = 0;

const header =
  "certification_slug,domain_slug,objective_id,title,description,option_a,option_b,option_c,option_d,correct_option,difficulty,tags,explanation,reference_urls";

for (const file of files) {
  const bp = JSON.parse(readFileSync(join(BLUEPRINTS_DIR, file), "utf-8"));
  const rows = [];
  const domainDist = distributeByWeight(bp.domains, TARGET);

  for (const { domain, count: domainCount } of domainDist) {
    if (domainCount === 0 || !domain.objectives?.length) continue;
    const perObj = Math.ceil(domainCount / domain.objectives.length);
    let domainWritten = 0;

    for (const objective of domain.objectives) {
      const objCount = Math.min(perObj, domainCount - domainWritten);
      if (objCount <= 0) break;
      const diffs = buildDifficultyPlan(objCount);
      for (let v = 0; v < objCount; v++) {
        rows.push(generateQuestion(bp, domain, objective, v, diffs[v]));
        domainWritten++;
      }
    }

    while (domainWritten < domainCount && domain.objectives.length > 0) {
      const obj = domain.objectives[domainWritten % domain.objectives.length];
      const diffs = buildDifficultyPlan(1);
      rows.push(generateQuestion(bp, domain, obj, domainWritten, diffs[0]));
      domainWritten++;
    }
  }

  while (rows.length < TARGET && bp.domains[0]?.objectives?.[0]) {
    const d = bp.domains[rows.length % bp.domains.length];
    const o = d.objectives[rows.length % d.objectives.length];
    rows.push(generateQuestion(bp, d, o, rows.length, "MEDIUM"));
  }
  if (rows.length > TARGET) rows.length = TARGET;

  const csv = [header, ...rows.map(rowToCsv)].join("\n");
  writeFileSync(join(OUT_DIR, `${bp.slug}.csv`), csv);
  console.log(`  ${bp.slug}: ${rows.length} questions → generated/${bp.slug}.csv`);
  grandTotal += rows.length;
}

console.log(`\nGenerated ${grandTotal} questions across ${files.length} certifications.`);
