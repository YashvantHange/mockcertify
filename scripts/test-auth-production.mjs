/**
 * Test login & signup on production (Vercel) and optionally local API.
 * Usage: node scripts/test-auth-production.mjs [baseUrl]
 * Default: https://mockcertify-web.vercel.app
 */
const BASE = (process.argv[2] ?? "https://mockcertify-web.vercel.app").replace(/\/$/, "");
const API = `${BASE}/api/v1`;

const results = [];
const jar = { cookies: "" };

function parseCookies(res) {
  const getSetCookie = res.headers.getSetCookie?.bind(res.headers);
  const list = getSetCookie ? getSetCookie() : [];
  if (list.length) {
    jar.cookies = list.map((c) => c.split(";")[0]).join("; ");
    return;
  }
  const raw = res.headers.get("set-cookie");
  if (raw) jar.cookies = raw.split(/,(?=\s*\w+=)/).map((c) => c.split(";")[0]).join("; ");
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jar.cookies ? { Cookie: jar.cookies } : {}),
      ...options.headers,
    },
  });
  parseCookies(res);
  const data = await res.json().catch(() => ({}));
  return { res, data };
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

const testEmail = `testuser_${Date.now()}@mockcertify.test`;
const testPassword = "TestPass123!";

console.log(`\nAuth tests → ${BASE}\n`);

await test("GET /auth/config", async () => {
  const { res, data } = await api("/auth/config");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (typeof data.googleOAuth !== "boolean") throw new Error("missing googleOAuth");
});

await test("POST /auth/login — admin seed account", async () => {
  jar.cookies = "";
  const { res, data } = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@certprep.local", password: "Admin123!@#" }),
  });
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (!data.user?.email) throw new Error("no user in response");
  if (!jar.cookies.includes("access_token")) throw new Error("no access_token cookie");
});

await test("GET /auth/me — admin session", async () => {
  const { res, data } = await api("/auth/me");
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (data.user?.role !== "ADMIN") throw new Error(`expected ADMIN, got ${data.user?.role}`);
});

await test("POST /auth/login — wrong password rejected", async () => {
  jar.cookies = "";
  const { res, data } = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@certprep.local", password: "wrong-password" }),
  });
  if (res.ok) throw new Error("expected failure");
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
});

await test("POST /auth/register — new test user", async () => {
  jar.cookies = "";
  const { res, data } = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Test User", email: testEmail, password: testPassword }),
  });
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (!data.user?.email) throw new Error("no user in response");
  if (!jar.cookies.includes("access_token")) throw new Error("no access_token cookie");
});

await test("GET /auth/me — new user session", async () => {
  const { res, data } = await api("/auth/me");
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (data.user?.email !== testEmail) throw new Error(`email mismatch: ${data.user?.email}`);
});

await test("POST /auth/login — new test user", async () => {
  jar.cookies = "";
  const { res, data } = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (data.user?.email !== testEmail) throw new Error("login email mismatch");
});

await test("POST /auth/register — duplicate email rejected", async () => {
  jar.cookies = "";
  const { res, data } = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Dup", email: testEmail, password: testPassword }),
  });
  if (res.ok) throw new Error("expected duplicate rejection");
  if (res.status !== 400) throw new Error(`expected 400, got ${res.status}: ${data.error}`);
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("\nFailed:");
  for (const f of failed) console.log(`  - ${f.name}: ${f.error}`);
  process.exit(1);
}
console.log(`\nTest accounts:\n  Admin: admin@certprep.local / Admin123!@#\n  Created: ${testEmail} / ${testPassword}\n`);
