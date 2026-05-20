import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

export const QUESTIONS_PER_CERTIFICATION = 500;

const BLUEPRINTS_DIR = join(__dirname, "..", "content", "blueprints");

export const categories = [
  {
    name: "Cloud Certifications",
    slug: "cloud",
    description: "AWS, Azure, Google Cloud, and Kubernetes certifications",
    icon: "cloud",
    sortOrder: 1,
  },
  {
    name: "Cybersecurity Certifications",
    slug: "cybersecurity",
    description: "Security+, CEH, CISSP, OSCP, and cloud security specialties",
    icon: "shield",
    sortOrder: 2,
  },
  {
    name: "Networking Certifications",
    slug: "networking",
    description: "CCNA, Network+, and infrastructure networking paths",
    icon: "network",
    sortOrder: 3,
  },
  {
    name: "AI Certifications",
    slug: "ai-ml",
    description: "Machine learning and AI certification paths",
    icon: "brain",
    sortOrder: 4,
  },
  {
    name: "Project Management Certifications",
    slug: "project-management",
    description: "PMP, ITIL, and agile project management credentials",
    icon: "briefcase",
    sortOrder: 5,
  },
];

export const certifications = [
  { slug: "aws-saa-c03", name: "AWS Solutions Architect Associate", provider: "AWS", categorySlug: "cloud", durationMinutes: 130, passingScore: 72 },
  { slug: "aws-security-specialty", name: "AWS Security Specialty", provider: "AWS", categorySlug: "cloud", durationMinutes: 170, passingScore: 75 },
  { slug: "az-900", name: "Microsoft Azure Fundamentals (AZ-900)", provider: "Microsoft", categorySlug: "cloud", durationMinutes: 60, passingScore: 70 },
  { slug: "sc-200", name: "Microsoft Security Operations Analyst (SC-200)", provider: "Microsoft", categorySlug: "cloud", durationMinutes: 120, passingScore: 70 },
  { slug: "google-cloud-associate", name: "Google Cloud Associate Cloud Engineer", provider: "Google", categorySlug: "cloud", durationMinutes: 120, passingScore: 70 },
  { slug: "cka", name: "Certified Kubernetes Administrator (CKA)", provider: "CNCF", categorySlug: "cloud", durationMinutes: 120, passingScore: 66 },
  { slug: "ceh", name: "Certified Ethical Hacker (CEH)", provider: "EC-Council", categorySlug: "cybersecurity", durationMinutes: 240, passingScore: 70 },
  { slug: "security-plus", name: "CompTIA Security+", provider: "CompTIA", categorySlug: "cybersecurity", durationMinutes: 90, passingScore: 75 },
  { slug: "cissp", name: "CISSP", provider: "ISC2", categorySlug: "cybersecurity", durationMinutes: 180, passingScore: 70 },
  { slug: "oscp", name: "Offensive Security Certified Professional (OSCP)", provider: "Offensive Security", categorySlug: "cybersecurity", durationMinutes: 1440, passingScore: 70 },
  { slug: "ccna", name: "Cisco CCNA", provider: "Cisco", categorySlug: "networking", durationMinutes: 120, passingScore: 82 },
  { slug: "network-plus", name: "CompTIA Network+", provider: "CompTIA", categorySlug: "networking", durationMinutes: 90, passingScore: 72 },
  { slug: "linux-plus", name: "CompTIA Linux+", provider: "CompTIA", categorySlug: "networking", durationMinutes: 90, passingScore: 72 },
  { slug: "aws-ml-specialty", name: "AWS Machine Learning Specialty", provider: "AWS", categorySlug: "ai-ml", durationMinutes: 180, passingScore: 75 },
  { slug: "pmp", name: "Project Management Professional (PMP)", provider: "PMI", categorySlug: "project-management", durationMinutes: 230, passingScore: 61 },
  { slug: "itil-foundation", name: "ITIL 4 Foundation", provider: "AXELOS", categorySlug: "project-management", durationMinutes: 60, passingScore: 65 },
];

const providerDocs: Record<string, string[]> = {
  AWS: ["https://docs.aws.amazon.com/", "https://aws.amazon.com/certification/"],
  Microsoft: ["https://learn.microsoft.com/en-us/certifications/", "https://docs.microsoft.com/azure/"],
  Google: ["https://cloud.google.com/certification", "https://cloud.google.com/docs"],
  CNCF: ["https://kubernetes.io/docs/", "https://www.cncf.io/certification/cka/"],
  "EC-Council": ["https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/"],
  CompTIA: ["https://www.comptia.org/certifications"],
  ISC2: ["https://www.isc2.org/certifications/cissp"],
  "Offensive Security": ["https://www.offensive-security.com/oscp/"],
  Cisco: ["https://learningnetwork.cisco.com/s/ccna"],
  PMI: ["https://www.pmi.org/certifications/project-management-pmp"],
  AXELOS: ["https://www.axelos.com/certifications/itil-service-management"],
};

export function loadBlueprintFromFile(slug: string): {
  slug: string;
  domains: { name: string; slug: string; weightPercent: number }[];
} | null {
  const path = join(BLUEPRINTS_DIR, `${slug}.json`);
  if (!existsSync(path)) return null;
  const bp = JSON.parse(readFileSync(path, "utf-8")) as {
    slug: string;
    domains: { name: string; slug: string; weightPercent: number }[];
  };
  return bp;
}

export function getAllBlueprintSlugs(): string[] {
  if (!existsSync(BLUEPRINTS_DIR)) return [];
  return readdirSync(BLUEPRINTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getDomainsForCert(slug: string): { name: string; slug: string; weightPercent: number }[] {
  const bp = loadBlueprintFromFile(slug);
  if (bp?.domains?.length) {
    return bp.domains.map((d) => ({
      name: d.name,
      slug: d.slug,
      weightPercent: d.weightPercent,
    }));
  }
  return [
    { name: "Core Concepts", slug: "core-concepts", weightPercent: 35 },
    { name: "Implementation", slug: "implementation", weightPercent: 35 },
    { name: "Operations & Security", slug: "operations-security", weightPercent: 30 },
  ];
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  options: { key: string; text: string; isCorrect: boolean }[];
  explanation: string;
  referenceLinks: string[];
}

const easyScenarios = [
  "What is the primary purpose of",
  "Which definition best describes",
  "Identify the core benefit of",
  "What is a fundamental characteristic of",
  "Which statement is true about",
];

const mediumScenarios = [
  "A team needs to implement",
  "Which approach should be used when",
  "What is the recommended configuration for",
  "During a deployment, you must",
  "Which service or feature best supports",
];

const hardScenarios = [
  "A multi-region architecture requires",
  "Given strict compliance and zero-downtime requirements",
  "An enterprise must optimize cost while maintaining",
  "A security incident involves",
  "Complex failover and disaster recovery demand",
];

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function buildDifficultyPlan(total: number): Difficulty[] {
  const perLevel = Math.floor(total / 3);
  const remainder = total - perLevel * 3;
  const plan: Difficulty[] = [];
  for (let i = 0; i < perLevel + (remainder > 0 ? 1 : 0); i++) plan.push("EASY");
  for (let i = 0; i < perLevel + (remainder > 1 ? 1 : 0); i++) plan.push("MEDIUM");
  for (let i = 0; i < perLevel; i++) plan.push("HARD");
  return plan;
}

/** @deprecated Use blueprint CSV import (`pnpm db:generate-questions` + `pnpm db:import-content`) instead. */
export function generateQuestionBatch(
  certSlug: string,
  certName: string,
  provider: string,
  domainSlug: string,
  domainName: string,
  startIndex: number,
  count: number
): GeneratedQuestion[] {
  const refs = providerDocs[provider] ?? ["https://example.com/docs"];
  const difficulties = buildDifficultyPlan(count);
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const globalIndex = startIndex + i + 1;
    const difficulty = difficulties[i];
    const diffLabel =
      difficulty === "EASY" ? "Easy" : difficulty === "MEDIUM" ? "Moderate" : "Hard";

    let stem: string;
    let correctText: string;
    let wrongB: string;
    let wrongC: string;
    let wrongD: string;

    if (difficulty === "EASY") {
      stem = `${pick(easyScenarios, globalIndex)} ${domainName} in the context of ${certName}?`;
      correctText = `The foundational concept of ${domainName} aligned with ${certName} exam objectives`;
      wrongB = `A deprecated feature unrelated to ${domainName}`;
      wrongC = `An incorrect definition that reverses cause and effect`;
      wrongD = `A concept from a different certification track`;
    } else if (difficulty === "MEDIUM") {
      stem = `${pick(mediumScenarios, globalIndex)} ${domainName} for ${certName} (Q${globalIndex})?`;
      correctText = `Apply the standard best practice for ${domainName} per ${provider} guidance`;
      wrongB = `Use a shortcut that violates ${domainName} design principles`;
      wrongC = `Configure components in the wrong order for this scenario`;
      wrongD = `Rely on manual steps where automation is required`;
    } else {
      stem = `${pick(hardScenarios, globalIndex)} in ${domainName} for ${certName} (Q${globalIndex})?`;
      correctText = `Architect a solution using advanced ${domainName} patterns with fault tolerance and auditability`;
      wrongB = `Single-AZ deployment without backup or monitoring`;
      wrongC = `Over-permissive access that fails least-privilege review`;
      wrongD = `Ignore blueprint weighting and mix unrelated domain controls`;
    }

    const texts = [correctText, wrongB, wrongC, wrongD];
    const correctSlot = globalIndex % 4;
    const keys = ["A", "B", "C", "D"] as const;
    const rotated = [
      texts[correctSlot],
      texts[(correctSlot + 1) % 4],
      texts[(correctSlot + 2) % 4],
      texts[(correctSlot + 3) % 4],
    ];
    const correctKey = keys[correctSlot];

    questions.push({
      title: `[${diffLabel}] ${certName} — ${domainName} (#${globalIndex})`,
      description: stem,
      difficulty,
      tags: [certSlug, domainSlug, difficulty.toLowerCase(), diffLabel.toLowerCase()],
      options: rotated.map((text, idx) => ({
        key: keys[idx],
        text,
        isCorrect: keys[idx] === correctKey,
      })),
      explanation: `**Answer: ${correctKey}** — For ${diffLabel} difficulty in ${domainName}, option ${correctKey} reflects ${certName} blueprint expectations. Review ${provider} official materials and hands-on labs. Question ID: ${certSlug}-${domainSlug}-${globalIndex}.`,
      referenceLinks: refs,
    });
  }

  return questions;
}

/** Distribute `total` questions across domains as evenly as possible. */
export function distributeAcrossDomains(
  domains: { slug: string; name: string }[],
  total: number
): { domain: { slug: string; name: string }; count: number }[] {
  const base = Math.floor(total / domains.length);
  let remainder = total % domains.length;
  return domains.map((domain) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    return { domain, count: base + extra };
  });
}
