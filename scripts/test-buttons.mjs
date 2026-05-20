const API = "http://localhost:4000/api/v1";
const results = [];

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

const jar = { cookies: "" };

function parseCookies(res) {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const part = c.split(";")[0];
    if (jar.cookies) jar.cookies += "; " + part;
    else jar.cookies = part;
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
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let certId, attemptId;

await test("GET /categories", () => api("/categories"));
await test("GET /certifications/featured", () => api("/certifications/featured"));
await test("GET /plans", () => api("/plans"));
await test("GET /leaderboards", () => api("/leaderboards?period=WEEKLY"));
await test("GET /community/discussions", () => api("/community/discussions"));

await test("POST /auth/login (admin)", async () => {
  const d = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@certprep.local", password: "Admin123!@#" }),
  });
  if (!d.user) throw new Error("No user in response");
});

await test("GET /auth/me", () => api("/auth/me"));
await test("GET /analytics/dashboard", () => api("/analytics/dashboard"));
await test("GET /admin/stats", () => api("/admin/stats"));
await test("GET /admin/certifications", () => api("/admin/certifications"));
await test("GET /admin/questions", () => api("/admin/questions?limit=5"));
await test("GET /admin/users", () => api("/admin/users"));
await test("GET /admin/reports", () => api("/admin/reports"));
await test("GET /admin/plans", () => api("/admin/plans"));

await test("GET /certifications/aws-saa-c03", async () => {
  const d = await api("/certifications/aws-saa-c03");
  certId = d.certification.id;
});

await test("POST /exams/start PRACTICE", async () => {
  const d = await api("/exams/start", {
    method: "POST",
    body: JSON.stringify({ certificationId: certId, mode: "PRACTICE" }),
  });
  if (!d.questions?.length) throw new Error("No questions");
  attemptId = d.attemptId;
});

await test("PATCH /exams/:id/answer", async () => {
  const start = await api(`/exams/${attemptId}`);
  const q = start.attempt?.answers?.[0]?.questionId ?? start.questions?.[0]?.questionId;
  const opt = start.attempt?.answers?.[0]?.question?.options?.[0]?.id;
  if (!q || !opt) {
    const cached = await api(`/exams/${attemptId}`);
    throw new Error("Cannot find question");
  }
  await api(`/exams/${attemptId}/answer`, {
    method: "PATCH",
    body: JSON.stringify({ questionId: q, selectedOptionId: opt }),
  });
});

await test("POST /exams/:id/submit", async () => {
  const d = await api(`/exams/${attemptId}/submit`, { method: "POST" });
  if (d.score === undefined) throw new Error("No score");
});

await test("POST /community/discussions", async () => {
  await api("/community/discussions", {
    method: "POST",
    body: JSON.stringify({ title: "Test discussion", body: "Automated test post body content here." }),
  });
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
