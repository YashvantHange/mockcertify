"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function getApiBase() {
  if (typeof window !== "undefined") {
    const pub = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (!pub || pub === "/" || pub === "same-origin") return "";
    return pub.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

interface ValidateResult {
  totalRows: number;
  validRows: number;
  duplicateTitles: number;
  errors: { row: number; valid: boolean; error?: string }[];
  canImport?: boolean;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; error: string }[];
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [blueprints, setBlueprints] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState("");
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const base = getApiBase();
    fetch(`${base}/api/v1/admin/blueprints`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBlueprints(d.certifications ?? []))
      .catch(() => {});
  }, []);

  async function handleValidate() {
    if (!file) return;
    setLoading(true);
    setValidateResult(null);
    setImportResult(null);
    const form = new FormData();
    form.append("file", file);
    const base = getApiBase();
    const res = await fetch(`${base}/api/v1/admin/questions/validate-csv`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    setValidateResult(await res.json());
    setLoading(false);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const base = getApiBase();
    const res = await fetch(`${base}/api/v1/admin/questions/bulk-csv`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    setImportResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Bulk CSV Import</h1>

      <Card className="mb-6 p-4">
        <h2 className="font-semibold mb-2">Templates & references</h2>
        <p className="text-sm text-slate-500 mb-3">
          Columns: certification_slug, domain_slug, objective_id, title, description,
          option_a–d, correct_option, difficulty, tags, explanation, reference_urls
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${getApiBase()}/api/v1/admin/questions/slug-cheat-sheet`}
            className="text-sm text-blue-600 underline"
          >
            Download slug cheat sheet
          </a>
          {selectedCert && (
            <a
              href={`${getApiBase()}/api/v1/admin/questions/csv-template/${selectedCert}`}
              className="text-sm text-blue-600 underline"
            >
              Download template for {selectedCert}
            </a>
          )}
        </div>
        <select
          className="mt-3 w-full rounded border px-3 py-2 text-sm"
          value={selectedCert}
          onChange={(e) => setSelectedCert(e.target.value)}
        >
          <option value="">Select cert for template download</option>
          {blueprints.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex gap-2">
            <Button type="button" disabled={!file || loading} onClick={handleValidate}>
              {loading ? "Working..." : "Validate CSV"}
            </Button>
            <Button type="button" disabled={!file || loading} onClick={handleUpload}>
              Import (skip duplicates)
            </Button>
          </div>
        </div>

        {validateResult && (
          <div className="mt-6 text-sm space-y-1">
            <p>
              Validation: {validateResult.validRows} / {validateResult.totalRows} rows OK
              {validateResult.duplicateTitles > 0 &&
                ` (${validateResult.duplicateTitles} duplicates)`}
            </p>
            {validateResult.errors?.slice(0, 15).map((err) => (
              <p key={err.row} className="text-amber-600">
                Row {err.row}: {err.error}
              </p>
            ))}
          </div>
        )}

        {importResult && (
          <div className="mt-6 text-sm">
            <p className="text-green-600">Imported: {importResult.imported}</p>
            {importResult.skipped > 0 && (
              <p className="text-slate-500">Skipped duplicates: {importResult.skipped}</p>
            )}
            {importResult.errors?.map((err) => (
              <p key={err.row} className="text-red-500">
                Row {err.row}: {err.error}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
