import { User } from '../types';

const PLACEHOLDER_SUBJECTS = new Set([
  'a definir pelo professor',
  'selecionar materia',
  'componente curricular',
  'geral',
]);

export function normalizeTeacherText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTeacherSubjects(
  user?: Pick<User, 'subject' | 'subjects'> | null
): string[] {
  if (!user) return [];

  const collected: string[] = [];

  if (Array.isArray(user.subjects)) {
    user.subjects.forEach((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed && !PLACEHOLDER_SUBJECTS.has(normalizeTeacherText(trimmed))) {
          collected.push(trimmed);
        }
      }
    });
  }

  if (typeof user.subject === 'string' && user.subject.trim()) {
    user.subject
      .split(/[,;|\n]+/)
      .map((s) => s.trim())
      .filter((s) => s && !PLACEHOLDER_SUBJECTS.has(normalizeTeacherText(s)))
      .forEach((s) => collected.push(s));
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of collected) {
    const key = normalizeTeacherText(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

export function getTeacherClasses(user?: Pick<User, 'classes'> | null): string[] {
  if (!user || !Array.isArray(user.classes)) return [];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const cls of user.classes) {
    if (typeof cls === 'string') {
      const trimmed = cls.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        unique.push(trimmed);
      }
    }
  }
  return unique;
}

export function isUnassignedReportComponent(
  component?: string | null,
  knownSubjects: string[] = []
): boolean {
  if (!component || !component.trim()) return true;
  const trimmed = component.trim();
  const norm = normalizeTeacherText(trimmed);

  if (PLACEHOLDER_SUBJECTS.has(norm)) return true;

  // If it matches an exact known subject (even if that subject contains a comma), it is valid
  if (knownSubjects.some((s) => normalizeTeacherText(s) === norm)) {
    return false;
  }

  // Legacy multi-subject concatenated strings like "Matemática, Física"
  if (trimmed.includes(',') || trimmed.includes(';')) {
    return true;
  }

  return false;
}
