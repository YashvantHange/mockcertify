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
  name: string;
  provider: string;
  officialGuideUrl: string;
  lastReviewed: string;
  questionsTarget: number;
  difficultyMix: { easy: number; medium: number; hard: number };
  referenceUrls: string[];
  domains: BlueprintDomain[];
}

export interface CsvQuestionRow {
  certification_slug: string;
  domain_slug: string;
  objective_id: string;
  title: string;
  description: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string;
  explanation: string;
  reference_urls: string;
}
