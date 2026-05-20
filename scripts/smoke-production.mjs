/**
 * Production smoke test: question counts, exam start, overlap check.
 * Run with API up: node scripts/smoke-production.mjs
 */
const API = process.env.API_URL ?? "http://localhost:4000/api/v1";
const TARGET = 500;
const CERTS = [
  "aws-saa-c03",
  "aws-security-specialty",
  "aws-ml-specialty",
  "az-900",
  "sc-200",
  "google-cloud-associate",
  "cka",
  "ceh",
  "security-plus",
  "cissp",
  "oscp",
  "ccna",
  "network-plus",
  "linux-plus",
  "pmp",
  "itil-foundation",
];

const results = [];
const jar = { cookies: "" };

function parseCookies(res) {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const part = c.split(";")[0];
    jar.cookies = jar.cookies ? `${jar.cookies}; ${part}` : part;
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: jar.cookies,
      ...options.headers,
    },
  });
  parseCookies(res);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    console.log(`✗ ${name}: ${e.message}`);
  }
}

console.log("MockCertify production smoke test\n");

await test("API health", async () => {
  const res = await fetch(`${API.replace("/api/v1", "")}/health`);
  if (!res.ok) throw new Error(`Health ${res.status}`);
});

await test("Admin login", async () => {
  await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@certprep.local", password: "Admin123!@#" }),
  });
});

for (const slug of CERTS) {
  await test(`${slug}: ≥${TARGET} active questions`, async () => {
    const d = await api(`/certifications/${slug}`);
    const count = d.certification._count?.questions ?? 0;
    if (count < TARGET) throw new Error(`Only ${count} questions (need ${TARGET})`);
  });
}

await test("Customize exam: 50 questions", async () => {
  const d = await api("/certifications/aws-saa-c03");
  const certId = d.certification.id;
  const start = await api("/exams/start", {
    method: "POST",
    body: JSON.stringify({
      certificationId: certId,
      mode: "PRACTICE",
      questionCount: 50,
    }),
  });
  if (start.questions.length !== 50) {
    throw new Error(`Expected 50 questions, got ${start.questions.length}`);
  }
});

await test("Low overlap across 3 practice attempts", async () => {
  const d = await api("/certifications/aws-saa-c03");
  const certId = d.certification.id;
  const sets = [];
  for (let i = 0; i < 3; i++) {
    const start = await api("/exams/start", {
      method: "POST",
      body: JSON.stringify({
        certificationId: certId,
        mode: "PRACTICE",
        questionCount: 30,
      }),
    });
    sets.push(new Set(start.questions.map((q) => q.id)));
  }
  const overlap12 = [...sets[0]].filter((id) => sets[1].has(id)).length;
  const overlap23 = [...sets[1]].filter((id) => sets[2].has(id)).length;
  const maxOverlap = Math.max(overlap12, overlap23);
  if (maxOverlap > 15) {
    throw new Error(`High overlap: ${maxOverlap}/30 repeated between attempts`);
  }
});

await test("Admin stats: ≥8000 questions", async () => {
  const d = await api("/admin/stats");
  if (d.questions < 8000) throw new Error(`Total questions: ${d.questions}`);
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  failed.forEach((f) => console.log(`  FAIL: ${f.name} — ${f.error}`));
  process.exit(1);
}
