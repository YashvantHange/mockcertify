/**
 * Static catalog used when the API is unreachable (e.g. Vercel without API_PROXY_TARGET).
 * Kept in sync with packages/database/prisma/seed-data.ts.
 */
export const QUESTIONS_PER_CERT = 500;

export const catalogCategories = [
  {
    id: "cat-cloud",
    name: "Cloud Certifications",
    slug: "cloud",
    description: "AWS, Azure, Google Cloud, and Kubernetes certifications",
    icon: "cloud",
    sortOrder: 1,
    certifications: [
      { id: "cert-aws-saa-c03", name: "AWS Solutions Architect Associate", slug: "aws-saa-c03", provider: "AWS", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-aws-security-specialty", name: "AWS Security Specialty", slug: "aws-security-specialty", provider: "AWS", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-az-900", name: "Microsoft Azure Fundamentals (AZ-900)", slug: "az-900", provider: "Microsoft", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-sc-200", name: "Microsoft Security Operations Analyst (SC-200)", slug: "sc-200", provider: "Microsoft", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-google-cloud-associate", name: "Google Cloud Associate Cloud Engineer", slug: "google-cloud-associate", provider: "Google", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-cka", name: "Certified Kubernetes Administrator (CKA)", slug: "cka", provider: "CNCF", _count: { questions: QUESTIONS_PER_CERT } },
    ],
  },
  {
    id: "cat-cybersecurity",
    name: "Cybersecurity Certifications",
    slug: "cybersecurity",
    description: "Security+, CEH, CISSP, OSCP, and cloud security specialties",
    icon: "shield",
    sortOrder: 2,
    certifications: [
      { id: "cert-ceh", name: "Certified Ethical Hacker (CEH)", slug: "ceh", provider: "EC-Council", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-security-plus", name: "CompTIA Security+", slug: "security-plus", provider: "CompTIA", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-cissp", name: "CISSP", slug: "cissp", provider: "ISC2", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-oscp", name: "Offensive Security Certified Professional (OSCP)", slug: "oscp", provider: "Offensive Security", _count: { questions: QUESTIONS_PER_CERT } },
    ],
  },
  {
    id: "cat-networking",
    name: "Networking Certifications",
    slug: "networking",
    description: "CCNA, Network+, and infrastructure networking paths",
    icon: "network",
    sortOrder: 3,
    certifications: [
      { id: "cert-ccna", name: "Cisco CCNA", slug: "ccna", provider: "Cisco", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-network-plus", name: "CompTIA Network+", slug: "network-plus", provider: "CompTIA", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-linux-plus", name: "CompTIA Linux+", slug: "linux-plus", provider: "CompTIA", _count: { questions: QUESTIONS_PER_CERT } },
    ],
  },
  {
    id: "cat-ai-ml",
    name: "AI Certifications",
    slug: "ai-ml",
    description: "Machine learning and AI certification paths",
    icon: "brain",
    sortOrder: 4,
    certifications: [
      { id: "cert-aws-ml-specialty", name: "AWS Machine Learning Specialty", slug: "aws-ml-specialty", provider: "AWS", _count: { questions: QUESTIONS_PER_CERT } },
    ],
  },
  {
    id: "cat-project-management",
    name: "Project Management Certifications",
    slug: "project-management",
    description: "PMP, ITIL, and agile project management credentials",
    icon: "briefcase",
    sortOrder: 5,
    certifications: [
      { id: "cert-pmp", name: "Project Management Professional (PMP)", slug: "pmp", provider: "PMI", _count: { questions: QUESTIONS_PER_CERT } },
      { id: "cert-itil-foundation", name: "ITIL 4 Foundation", slug: "itil-foundation", provider: "AXELOS", _count: { questions: QUESTIONS_PER_CERT } },
    ],
  },
];

export const allCertifications = catalogCategories.flatMap((c) =>
  c.certifications.map((cert) => ({
    ...cert,
    isActive: true,
    durationMinutes: 120,
    passingScore: 70,
    category: { name: c.name, slug: c.slug },
    _count: { questions: QUESTIONS_PER_CERT, domains: 3 },
  }))
);

export function getCertificationBySlug(slug: string) {
  const flat = catalogCategories.find((cat) =>
    cat.certifications.some((c) => c.slug === slug)
  );
  if (!flat) return null;
  const cert = flat.certifications.find((c) => c.slug === slug)!;
  return {
    certification: {
      id: cert.id,
      name: cert.name,
      slug: cert.slug,
      provider: cert.provider,
      isActive: true,
      durationMinutes: 120,
      passingScore: 70,
      category: {
        id: flat.id,
        name: flat.name,
        slug: flat.slug,
        description: flat.description,
        icon: flat.icon,
      },
      domains: [
        { id: `${cert.id}-d1`, name: "Core Concepts", slug: "core-concepts", weightPercent: 35 },
        { id: `${cert.id}-d2`, name: "Implementation", slug: "implementation", weightPercent: 35 },
        { id: `${cert.id}-d3`, name: "Operations & Security", slug: "operations-security", weightPercent: 30 },
      ],
      _count: { questions: QUESTIONS_PER_CERT },
    },
    userProgress: null,
  };
}
