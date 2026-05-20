/** Deterministic shuffle so the same attempt always shows the same option order. */
export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    h = (Math.imul(1103515245, h) + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function shuffleQuestionOptions<T extends { id: string; key: string; text: string }>(
  options: T[],
  attemptId: string,
  questionId: string
): T[] {
  const shuffled = shuffleWithSeed(options, `${attemptId}:${questionId}`);
  const keys = ["A", "B", "C", "D"];
  return shuffled.map((opt, i) => ({ ...opt, key: keys[i] ?? opt.key }));
}
