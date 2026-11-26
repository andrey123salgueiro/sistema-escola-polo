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

function getMappedSubjectsEntry(
  user?: Pick<User, 'classSubjects'> | null,
  classGroup?: string | null
): string[] | null {
  if (!user?.classSubjects || !classGroup) return null;

  const exact = user.classSubjects[classGroup];
  if (Array.isArray(exact) && exact.length > 0) {
    return exact;
  }

  const targetKey = normalizeTeacherText(classGroup);
  for (const [key, list] of Object.entries(user.classSubjects)) {
    if (normalizeTeacherText(key) === targetKey && Array.isArray(list) && list.length > 0) {
      return list;
    }
  }

  return null;
}

export function hasClassSubjectMappingForClass(
  user?: Pick<User, 'classSubjects'> | null,
  classGroup?: string | null
): boolean {
  return getMappedSubjectsEntry(user, classGroup) !== null;
}

export function getTeacherSubjectsForClass(
  user?: Pick<User, 'subject' | 'subjects' | 'classSubjects'> | null,
  classGroup?: string | null
): string[] {
  const allSubjects = getTeacherSubjects(user);
  const mapped = getMappedSubjectsEntry(user, classGroup);

  if (!mapped) {
    return allSubjects;
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of mapped) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      const key = normalizeTeacherText(trimmed);
      if (trimmed && !PLACEHOLDER_SUBJECTS.has(key) && !seen.has(key)) {
        seen.add(key);
        unique.push(trimmed);
      }
    }
  }

  return unique.length > 0 ? unique : allSubjects;
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
