import { parse } from "csv-parse/sync";
import { csvRowSchema } from "@certprep/shared";
import { prisma } from "@certprep/database";
import { loadBlueprint, validateRowAgainstBlueprint } from "./blueprint-validator";

export interface CsvImportRowResult {
  row: number;
  valid: boolean;
  error?: string;
  title?: string;
}

export interface CsvImportSummary {
  totalRows: number;
  validRows: number;
  duplicateTitles: number;
  errors: CsvImportRowResult[];
}

export function parseCsvContent(content: string): Record<string, string>[] {
  return parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];
}

export async function validateCsvContent(content: string): Promise<CsvImportSummary> {
  const records = parseCsvContent(content);
  const summary: CsvImportSummary = {
    totalRows: records.length,
    validRows: 0,
    duplicateTitles: 0,
    errors: [],
  };

  const seenTitles = new Map<string, Set<string>>();

  for (let i = 0; i < records.length; i++) {
    const rowNum = i + 2;
    const parsed = csvRowSchema.safeParse(records[i]);
    if (!parsed.success) {
      summary.errors.push({ row: rowNum, valid: false, error: "Invalid row format" });
      continue;
    }
    const row = parsed.data;

    const bp = loadBlueprint(row.certification_slug);
    if (!bp) {
      summary.errors.push({
        row: rowNum,
        valid: false,
        error: `No blueprint for certification ${row.certification_slug}`,
      });
      continue;
    }

    const bpError = validateRowAgainstBlueprint(row, bp);
    if (bpError) {
      summary.errors.push({ row: rowNum, valid: false, error: bpError });
      continue;
    }

    const cert = await prisma.certification.findUnique({
      where: { slug: row.certification_slug },
    });
    if (!cert) {
      summary.errors.push({
        row: rowNum,
        valid: false,
        error: `Certification ${row.certification_slug} not in database`,
      });
      continue;
    }

    const domain = await prisma.domain.findUnique({
      where: {
        certificationId_slug: { certificationId: cert.id, slug: row.domain_slug },
      },
    });
    if (!domain) {
      summary.errors.push({
        row: rowNum,
        valid: false,
        error: `Domain ${row.domain_slug} not in database — run pnpm db:seed`,
      });
      continue;
    }

    const titleKey = `${row.certification_slug}::${row.title}`;
    if (!seenTitles.has(row.certification_slug)) {
      seenTitles.set(row.certification_slug, new Set());
    }
    const titles = seenTitles.get(row.certification_slug)!;
    if (titles.has(row.title)) {
      summary.duplicateTitles++;
      summary.errors.push({ row: rowNum, valid: false, error: "Duplicate title in CSV" });
      continue;
    }
    titles.add(row.title);

    const existing = await prisma.question.findFirst({
      where: { certificationId: cert.id, title: row.title },
    });
    if (existing) {
      summary.duplicateTitles++;
      summary.errors.push({
        row: rowNum,
        valid: false,
        error: "Question with this title already exists (will skip on import)",
        title: row.title,
      });
      continue;
    }

    summary.validRows++;
  }

  return summary;
}

export async function importCsvContent(
  content: string,
  options: { skipDuplicates?: boolean } = { skipDuplicates: true }
): Promise<{ imported: number; skipped: number; errors: { row: number; error: string }[] }> {
  const records = parseCsvContent(content);
  const results = { imported: 0, skipped: 0, errors: [] as { row: number; error: string }[] };

  for (let i = 0; i < records.length; i++) {
    const parsed = csvRowSchema.safeParse(records[i]);
    if (!parsed.success) {
      results.errors.push({ row: i + 2, error: "Invalid row format" });
      continue;
    }
    const row = parsed.data;

    try {
      const bp = loadBlueprint(row.certification_slug);
      if (bp) {
        const bpError = validateRowAgainstBlueprint(row, bp);
        if (bpError) throw new Error(bpError);
      }

      const cert = await prisma.certification.findUnique({
        where: { slug: row.certification_slug },
      });
      if (!cert) throw new Error(`Certification ${row.certification_slug} not found`);

      const domain = await prisma.domain.findUnique({
        where: {
          certificationId_slug: { certificationId: cert.id, slug: row.domain_slug },
        },
      });
      if (!domain) throw new Error(`Domain ${row.domain_slug} not found`);

      const existing = await prisma.question.findFirst({
        where: { certificationId: cert.id, title: row.title },
      });
      if (existing) {
        if (options.skipDuplicates) {
          results.skipped++;
          continue;
        }
        throw new Error("Duplicate title");
      }

      const tags = row.tags ? row.tags.split("|").map((t) => t.trim()).filter(Boolean) : [];
      const refs = row.reference_urls
        ? row.reference_urls.split("|").map((u) => u.trim()).filter(Boolean)
        : [];
      const objectiveId = row.objective_id?.trim() || null;
      if (objectiveId && !tags.includes(objectiveId)) tags.push(objectiveId);

      await prisma.question.create({
        data: {
          certificationId: cert.id,
          domainId: domain.id,
          objectiveId,
          title: row.title,
          description: row.description ?? "",
          difficulty: row.difficulty,
          tags,
          options: {
            create: [
              { key: "A", text: row.option_a, isCorrect: row.correct_option === "A" },
              { key: "B", text: row.option_b, isCorrect: row.correct_option === "B" },
              { key: "C", text: row.option_c, isCorrect: row.correct_option === "C" },
              { key: "D", text: row.option_d, isCorrect: row.correct_option === "D" },
            ],
          },
          explanation: {
            create: { body: row.explanation, referenceLinks: refs },
          },
        },
      });
      results.imported++;
    } catch (e) {
      results.errors.push({ row: i + 2, error: (e as Error).message });
    }
  }

  return results;
}
