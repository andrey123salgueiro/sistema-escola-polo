import React, { useState, useRef } from 'react';
import { User, SchoolClass, SchoolSubject } from '../types';
import * as XLSX from 'xlsx';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
} from '../data/initialData';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Mail,
  BookOpen,
  Layers,
  CheckCircle,
  Search,
  KeyRound,
  Lock,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Check,
  X,
  PlusCircle,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { getTeacherSubjects } from '../utils/teacherUtils';

interface TeacherManagementProps {
  teachers: User[];
  classes?: SchoolClass[];
  subjects?: SchoolSubject[];
  onAddTeacher: (newTeacher: User) => void;
  onAddMultipleTeachers?: (newTeachers: User[]) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onAddSubject?: (newSubject: SchoolSubject) => void;
}

interface ImportedTeacherPreview {
  existingId?: string;
  name: string;
  subject: string;
  subjects: string[];
  classes: string[];
  email: string;
  password: string;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateInstitutionEmail(name: string): string {
  const local = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${local || 'professor'}@escola.gov.br`;
}

function compactClassKey(value: string): string {
  return normalizeText(value)
    .replace(/[º°ª]/g, '')
    .replace(/\b(ano|serie|turma)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function matchClassName(rawClass: string, availableClassNames: string[]): string {
  const trimmed = rawClass.trim();
  if (!trimmed) return '';

  const normRaw = normalizeText(trimmed);
  const exactMatch = availableClassNames.find((c) => normalizeText(c) === normRaw);
  if (exactMatch) return exactMatch;

  const compactRaw = compactClassKey(trimmed);
  if (compactRaw) {
    const compactMatch = availableClassNames.find(
      (c) => compactClassKey(c) === compactRaw
    );
    if (compactMatch) return compactMatch;
  }

  return trimmed;
}

function parseClassList(rawValue: string, availableClassNames: string[]): string[] {
  if (!rawValue) return [];
  const parts = rawValue
    .split(/[,;|\n]+|\s+\/\s+/)
    .map((p) => matchClassName(p, availableClassNames))
    .filter(Boolean);
  return Array.from(new Set(parts));
}

function matchSubjectName(
  rawSubject: string,
  availableSubjectNames: string[]
): string {
  const trimmed = rawSubject.trim();
  if (!trimmed) return '';

  const normRaw = normalizeText(trimmed);
  const exact = availableSubjectNames.find((s) => normalizeText(s) === normRaw);
  if (exact) return exact;

  if (normRaw === 'portugues' || normRaw === 'lingua portuguesa') {
    return (
      availableSubjectNames.find((s) => normalizeText(s) === 'lingua portuguesa') ||
      'Língua Portuguesa'
    );
  }
  if (normRaw === 'ingles' || normRaw === 'lingua inglesa') {
    return (
      availableSubjectNames.find((s) => normalizeText(s) === 'lingua inglesa') ||
      'Língua Inglesa'
    );
  }
  if (normRaw === 'ciencias' || normRaw === 'ciencias da natureza') {
    return (
      availableSubjectNames.find(
        (s) => normalizeText(s) === 'ciencias da natureza'
      ) || 'Ciências da Natureza'
    );
  }

  return trimmed;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  classes,
  subjects,
  onAddTeacher,
  onAddMultipleTeachers,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddSubject,
}) => {
  const availableClassNames =
    classes && classes.length > 0 ? classes.map((c) => c.name) : AVAILABLE_CLASSES;
  const availableSubjectNames =
    subjects && subjects.length > 0
      ? subjects.map((s) => s.name)
      : AVAILABLE_SUBJECTS;
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [showQuickSubject, setShowQuickSubject] = useState(false);
  const [quickSubjectName, setQuickSubjectName] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    availableSubjectNames[0] || AVAILABLE_SUBJECTS[0],
  ]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([
    availableClassNames[0] || '6º Ano A',
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);

  // Excel Import states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importedPreview, setImportedPreview] = useState<ImportedTeacherPreview[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('123');
    setSelectedSubjects([availableSubjectNames[0] || AVAILABLE_SUBJECTS[0]]);
    setSelectedClasses([availableClassNames[0] || '6º Ano A']);
    setEditingTeacherId(null);
    setShowQuickSubject(false);
    setQuickSubjectName('');
    setShowForm(false);
  };

  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleOpenEdit = (teacher: User) => {
    const currentSubjects = getTeacherSubjects(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setPassword(teacher.password || '123');
    setSelectedSubjects(
      currentSubjects.length > 0
        ? currentSubjects
        : [availableSubjectNames[0] || AVAILABLE_SUBJECTS[0]]
    );
    setSelectedClasses(teacher.classes || []);
    setEditingTeacherId(teacher.id);
    setShowForm(true);
    scrollToForm();
  };

  const handleToggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleToggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedbackMsg('Por favor, preencha o nome do professor.');
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    if (selectedSubjects.length === 0) {
      setFeedbackMsg('Por favor, selecione pelo menos uma matéria que o professor leciona.');
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim() || generateInstitutionEmail(cleanName);
    const cleanPass = password.trim() || '123';
    const joinedSubject = selectedSubjects.join(', ');

    if (editingTeacherId) {
      const existing = teachers.find((t) => t.id === editingTeacherId);
      if (existing) {
        onUpdateTeacher({
          ...existing,
          name: cleanName,
          username: cleanName,
          email: cleanEmail,
          password: cleanPass,
          subject: joinedSubject,
          subjects: selectedSubjects,
          classes: selectedClasses,
        });
        setFeedbackMsg(`Dados do professor(a) "${cleanName}" atualizados com sucesso!`);
      }
    } else {
      const newTeacher: User = {
        id: `prof-${Date.now()}`,
        name: cleanName,
        username: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: 'professor',
        subject: joinedSubject,
        subjects: selectedSubjects,
        classes: selectedClasses,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddTeacher(newTeacher);
      setFeedbackMsg(
        `Professor(a) "${cleanName}" cadastrado com sucesso! Usuário: "${cleanName}" | Senha: "${cleanPass}".`
      );
    }

    setTimeout(() => setFeedbackMsg(null), 4000);
    resetForm();
  };

  // Excel / CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportedPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        if (!buffer) {
          setImportError('Não foi possível ler o arquivo selecionado.');
          return;
        }

        const workbook = XLSX.read(new Uint8Array(buffer as ArrayBuffer), {
          type: 'array',
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        if (rawRows.length < 2) {
          setImportError('A planilha parece vazia ou sem linhas de dados.');
          return;
        }

        // Find header row within the first 5 non-empty rows
        let headerRowIdx = 0;
        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          const rowText = Array.from(rawRows[r] || [], (cell) =>
            normalizeText(String(cell ?? ''))
          ).join(' ');
          if (
            rowText.includes('nome') ||
            rowText.includes('professor') ||
            rowText.includes('docente') ||
            rowText.includes('turma') ||
            rowText.includes('materia') ||
            rowText.includes('disciplina')
          ) {
            headerRowIdx = r;
            break;
          }
        }

        const headers: string[] = Array.from(
          rawRows[headerRowIdx] || [],
          (h: any) => normalizeText(String(h ?? ''))
        );

        let nameIdx = headers.findIndex(
          (h) =>
            h.includes('nome') ||
            h.includes('professor') ||
            h.includes('professora') ||
            h.includes('docente') ||
            h === 'name'
        );
        const classIdx = headers.findIndex(
          (h) =>
            h.includes('turma') ||
            h.includes('classe') ||
            h.includes('serie') ||
            h.includes('ano')
        );
        const subjectIdx = headers.findIndex(
          (h) =>
            h.includes('materia') ||
            h.includes('disciplina') ||
            h.includes('componente') ||
            h.includes('subject')
        );
        const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('e-mail'));
        const passwordIdx = headers.findIndex(
          (h) => h.includes('senha') || h.includes('password')
        );

        if (nameIdx === -1) {
          nameIdx = 0;
        }

        // Group rows by normalized teacher name so multiple rows for the same teacher merge automatically
        const grouped = new Map<
          string,
          {
            name: string;
            subjects: string[];
            classes: string[];
            email: string;
            password: string;
          }
        >();

        for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const rawName = row[nameIdx] !== undefined && row[nameIdx] !== null
            ? String(row[nameIdx]).trim()
            : '';
          if (!rawName) continue;

          const normName = normalizeText(rawName);
          const rawClass =
            classIdx >= 0 && row[classIdx] !== undefined && row[classIdx] !== null
              ? String(row[classIdx]).trim()
              : '';
          const rawSubject =
            subjectIdx >= 0 && row[subjectIdx] !== undefined && row[subjectIdx] !== null
              ? String(row[subjectIdx]).trim()
              : '';
          const rawEmail =
            emailIdx >= 0 && row[emailIdx] !== undefined && row[emailIdx] !== null
              ? String(row[emailIdx]).trim()
              : '';
          const rawPassword =
            passwordIdx >= 0 && row[passwordIdx] !== undefined && row[passwordIdx] !== null
              ? String(row[passwordIdx]).trim()
              : '';

          const parsedClasses = parseClassList(rawClass, availableClassNames);
          const parsedSubjects = rawSubject
            .split(/[,;|\n]+/)
            .map((s) => matchSubjectName(s, availableSubjectNames))
            .filter(Boolean);

          const existingEntry = grouped.get(normName);
          if (existingEntry) {
            parsedClasses.forEach((c) => {
              if (!existingEntry.classes.includes(c)) existingEntry.classes.push(c);
            });
            parsedSubjects.forEach((s) => {
              if (!existingEntry.subjects.includes(s)) existingEntry.subjects.push(s);
            });
            if (!existingEntry.email && rawEmail) existingEntry.email = rawEmail;
            if (!existingEntry.password && rawPassword) existingEntry.password = rawPassword;
          } else {
            grouped.set(normName, {
              name: rawName,
              subjects: Array.from(new Set(parsedSubjects)),
              classes: parsedClasses,
              email: rawEmail,
              password: rawPassword,
            });
          }
        }

        if (grouped.size === 0) {
          setImportError(
            'Nenhum professor foi localizado na planilha informada. Verifique se há uma coluna com o nome do professor.'
          );
          return;
        }

        const existingByName = new Map<string, User>(
          teachers.map((t) => [normalizeText(t.name), t])
        );

        const previewList: ImportedTeacherPreview[] = Array.from(grouped.values()).map(
          (entry) => {
            const existingTeacher = existingByName.get(normalizeText(entry.name));
            const mergedClasses = existingTeacher
              ? Array.from(new Set([...(existingTeacher.classes || []), ...entry.classes]))
              : entry.classes;

            const existingSubjects = existingTeacher
              ? getTeacherSubjects(existingTeacher)
              : [];
            const mergedSubjects =
              entry.subjects.length > 0
                ? Array.from(new Set([...existingSubjects, ...entry.subjects]))
                : existingSubjects.length > 0
                ? existingSubjects
                : [availableSubjectNames[0] || AVAILABLE_SUBJECTS[0]];

            return {
              existingId: existingTeacher?.id,
              name: existingTeacher?.name || entry.name,
              subject: mergedSubjects.join(', '),
              subjects: mergedSubjects,
              classes: mergedClasses,
              email:
                entry.email ||
                existingTeacher?.email ||
                generateInstitutionEmail(entry.name),
              password: entry.password || existingTeacher?.password || '123',
            };
          }
        );

        setImportedPreview(previewList);
      } catch (err) {
        console.error('Error reading teachers excel file', err);
        setImportError(
          'Falha ao ler arquivo. Verifique se o arquivo está no formato Excel (.xlsx, .xls) ou CSV válido.'
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowStamp = Date.now();
    const existingById = new Map<string, User>(teachers.map((t) => [t.id, t]));

    const usersToSave: User[] = importedPreview.map((item, idx) => {
      const existing = item.existingId ? existingById.get(item.existingId) : undefined;
      if (existing) {
        return {
          ...existing,
          name: item.name,
          username: existing.username || item.name,
          email: item.email,
          password: item.password,
          subject: item.subject,
          subjects: item.subjects,
          classes: item.classes,
        };
      }
      return {
        id: `prof-imp-${nowStamp}-${idx}`,
        name: item.name,
        username: item.name,
        email: item.email,
        password: item.password,
        role: 'professor',
        subject: item.subject,
        subjects: item.subjects,
        classes: item.classes,
        createdAt: todayStr,
      };
    });

    if (onAddMultipleTeachers) {
      onAddMultipleTeachers(usersToSave);
    } else {
      usersToSave.forEach((u) => {
        if (existingById.has(u.id)) {
          onUpdateTeacher(u);
        } else {
          onAddTeacher(u);
        }
      });
    }

    const updatedCount = importedPreview.filter((i) => !!i.existingId).length;
    const newCount = importedPreview.length - updatedCount;
    setFeedbackMsg(
      updatedCount > 0
        ? `Importação concluída: ${newCount} professor(es) novo(s) e ${updatedCount} atualizado(s)!`
        : `${newCount} professor(es) importado(s) com sucesso a partir da planilha!`
    );
    setTimeout(() => setFeedbackMsg(null), 5000);

    setImportedPreview([]);
    setImportFileName(null);
    setImportError(null);
    setShowImportModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download template Excel for Teachers
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nome do Professor': 'Carlos Eduardo Souza',
        'Matéria': 'Matemática, Física',
        'Turmas': '6º Ano A, 7º Ano B, 1º Ano EM',
        'E-mail': 'carlos.souza@escola.gov.br',
        'Senha': '123',
      },
      {
        'Nome do Professor': 'Ana Paula Oliveira',
        'Matéria': 'Língua Portuguesa',
        'Turmas': '6º Ano A, 9º Ano A, 1º Ano EM',
        'E-mail': '',
        'Senha': '',
      },
      {
        'Nome do Professor': 'Roberto Silva Lima',
        'Matéria': 'Ciências da Natureza',
        'Turmas': '6º Ano B',
        'E-mail': '',
        'Senha': '',
      },
      {
        'Nome do Professor': 'Roberto Silva Lima',
        'Matéria': 'Biologia',
        'Turmas': '1º Ano EM',
        'E-mail': '',
        'Senha': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Professores_Modelo');
    XLSX.writeFile(workbook, 'modelo_cadastro_professores.xlsx');
  };

  // Export current teachers to Excel
  const handleExportTeachers = () => {
    const listToExport = filteredTeachers.map((t) => ({
      'Nome do Professor': t.name,
      'Matéria': getTeacherSubjects(t).join(', '),
      'Turmas': (t.classes || []).join(', '),
      'E-mail': t.email,
      'Senha': t.password || '123',
    }));

    const worksheet = XLSX.utils.json_to_sheet(listToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Professores');
    XLSX.writeFile(
      workbook,
      `professores_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const filteredTeachers = teachers.filter((t) => {
    const teacherSubjects = getTeacherSubjects(t);
    if (filterClass !== 'all' && !(t.classes || []).includes(filterClass)) {
      return false;
    }
    if (
      filterSubject !== 'all' &&
      !teacherSubjects.some((s) => normalizeText(s) === normalizeText(filterSubject))
    ) {
      return false;
    }

    const q = searchTerm.toLowerCase();
    if (!q.trim()) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      teacherSubjects.some((s) => s.toLowerCase().includes(q)) ||
      (t.classes && t.classes.some((c) => c.toLowerCase().includes(q)))
    );
  });

  // Ensure subject checkboxes include any extra assigned/imported subjects
  const allSubjectOptions = Array.from(
    new Set([...availableSubjectNames, ...selectedSubjects])
  );

  const handleQuickAddSubject = () => {
    const clean = quickSubjectName.trim();
    if (!clean || !onAddSubject) return;
    const exists = availableSubjectNames.find(
      (s) => normalizeText(s) === normalizeText(clean)
    );
    if (exists) {
      setSelectedSubjects((prev) =>
        prev.includes(exists) ? prev : [...prev, exists]
      );
      setQuickSubjectName('');
      setShowQuickSubject(false);
      return;
    }
    onAddSubject({
      id: `sub-${Date.now()}`,
      name: clean,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setSelectedSubjects((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setQuickSubjectName('');
    setShowQuickSubject(false);
  };

  // Ensure class checkboxes include any extra imported classes
  const allClassOptions = Array.from(
    new Set([...availableClassNames, ...selectedClasses])
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Cadastro de Professores & Importação Excel
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre docentes manualmente ou importe em lote pela planilha Excel (.xlsx) ou CSV com nome, turma e matéria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Baixar planilha modelo do Excel para professores"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Baixar Modelo Excel</span>
          </button>

          <button
            type="button"
            id="btn-open-teacher-excel-import"
            onClick={() => {
              setImportError(null);
              setImportedPreview([]);
              setImportFileName(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Arquivo Excel / CSV</span>
          </button>

          {!showForm && (
            <button
              id="btn-add-teacher"
              onClick={() => {
                resetForm();
                setShowForm(true);
                scrollToForm();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Professor</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Teacher Form (Add or Edit) */}
      {showForm && (
        <div ref={formRef} className="bg-white rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-700" />
              {editingTeacherId ? 'Editar Professor' : 'Cadastrar Novo Professor'}
            </h3>
            <button
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do(a) Professor(a) (Usuário de Acesso) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <p className="text-[11px] text-stone-500 mt-0.5">
                  O professor utilizará este nome para entrar no sistema.
                </p>
              </div>

              {/* Email / Login */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail Institucional (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="Deixe vazio para gerar automaticamente"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha de Acesso (Padrão: 123) *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Disciplinas (Múltipla Seleção) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Matérias / Componentes Curriculares Lecionados *{' '}
                  <span className="text-[11px] font-normal text-stone-500">
                    ({selectedSubjects.length}{' '}
                    {selectedSubjects.length === 1 ? 'selecionada' : 'selecionadas'})
                  </span>
                </label>
                {onAddSubject && (
                  <button
                    type="button"
                    onClick={() => setShowQuickSubject((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showQuickSubject ? 'Fechar' : '+ Nova Matéria'}</span>
                  </button>
                )}
              </div>

              {showQuickSubject && onAddSubject && (
                <div className="mb-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2">
                  <input
                    type="text"
                    placeholder="Digite o nome da nova matéria (ex: Física, Sociologia...)"
                    value={quickSubjectName}
                    onChange={(e) => setQuickSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickAddSubject();
                      }
                    }}
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddSubject}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {allSubjectOptions.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <label
                      key={sub}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSubject(sub)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{sub}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Você pode marcar uma ou mais matérias se o professor lecionar múltiplas disciplinas.
              </p>
            </div>

            {/* Turmas */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Turmas em que o docente leciona:{' '}
                <span className="text-[11px] font-normal text-stone-500">
                  ({selectedClasses.length}{' '}
                  {selectedClasses.length === 1 ? 'selecionada' : 'selecionadas'})
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {allClassOptions.map((cls) => {
                  const isChecked = selectedClasses.includes(cls);
                  return (
                    <label
                      key={cls}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked
                          ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleClass(cls)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{cls}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-teacher"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs"
              >
                {editingTeacherId ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Importar Professores via Arquivo Excel ou CSV
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {importError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-stone-50/50 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="teacher-excel-upload-input"
                />
                <label
                  htmlFor="teacher-excel-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {importFileName
                      ? `Arquivo selecionado: ${importFileName}`
                      : 'Clique para escolher a planilha Excel (.xlsx, .xls) ou CSV'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-1">
                    Colunas reconhecidas: <strong>Nome do Professor</strong>, <strong>Turma(s)</strong>, <strong>Matéria / Disciplina</strong> (e opcionalmente E-mail e Senha)
                  </span>
                </label>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-[11px] text-stone-600 space-y-1">
                <p className="font-bold text-stone-800">Como sua planilha pode estar organizada:</p>
                <p>
                  • <strong>Várias turmas ou várias matérias na mesma linha:</strong> separe por vírgula ou ponto e vírgula (ex: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">Matemática, Física</code> e <code className="bg-white px-1 py-0.5 rounded border border-stone-200">6º Ano A, 7º Ano B</code>).
                </p>
                <p>
                  • <strong>Uma turma/matéria por linha:</strong> se o mesmo professor aparecer em várias linhas, o sistema agrupa todas as turmas e matérias dele automaticamente.
                </p>
                <p>
                  • Senha padrão quando não informada na planilha: <code className="bg-white px-1 py-0.5 rounded border border-stone-200 font-bold">123</code>.
                </p>
              </div>

              {/* Preview Table */}
              {importedPreview.length > 0 && (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">
                      Prévia dos Professores Identificados ({importedPreview.length}):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pronto para gravar</span>
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 text-xs">
                    {importedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900">{item.name}</span>
                            {item.existingId ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                Atualizar / Mesclar
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Novo
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              {item.subject}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            {item.email} · Senha: <span className="font-mono font-bold">{item.password}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:justify-end">
                          {item.classes.length > 0 ? (
                            item.classes.map((cls) => (
                              <span
                                key={cls}
                                className="text-[10px] px-2 py-0.5 rounded bg-amber-50 border border-amber-200 font-semibold text-amber-900"
                              >
                                {cls}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-stone-400">Sem turma na planilha</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-confirm-teacher-import-excel"
                disabled={importedPreview.length === 0}
                onClick={handleConfirmImport}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  importedPreview.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Importação de {importedPreview.length} Professores</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Search & Filter header */}
        <div className="p-4 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-stone-50/50">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar professor por nome, matéria ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
              aria-label="Filtrar professores por turma"
            >
              <option value="all">Todas as Turmas</option>
              {availableClassNames.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
              aria-label="Filtrar professores por matéria"
            >
              <option value="all">Todas as Matérias</option>
              {availableSubjectNames.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <span className="text-xs text-stone-500">
              Total: <strong>{filteredTeachers.length}</strong> professores ativos
            </span>
            <button
              type="button"
              onClick={handleExportTeachers}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Exportar professores cadastrados para arquivo Excel"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Exportar Lista (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="divide-y divide-stone-100">
          {filteredTeachers.map((teacher) => {
            const teacherSubjects = getTeacherSubjects(teacher);
            return (
            <div
              key={teacher.id}
              className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{teacher.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-0.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      {teacherSubjects.length > 0 ? (
                        teacherSubjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-600 font-medium">Geral</span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      {teacher.email}
                    </span>
                    <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-mono">
                      <KeyRound className="w-3 h-3 text-amber-600" />
                      Senha: <strong>{teacher.password || '123'}</strong>
                    </span>
                  </div>

                  {/* Turmas Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {teacher.classes && teacher.classes.length > 0 ? (
                      teacher.classes.map((cls) => (
                        <span
                          key={cls}
                          className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold"
                        >
                          {cls}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-stone-400">Nenhuma turma atribuída</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold transition-colors"
                  title="Editar cadastro do professor"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherToDelete(teacher)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Excluir professor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Teacher Deletion */}
      <ConfirmDialog
        isOpen={!!teacherToDelete}
        title="Remover Professor(a)"
        message={`Deseja realmente remover o cadastro de "${teacherToDelete?.name}"? Esta ação removerá o acesso do docente às turmas e fichas do sistema.`}
        confirmText="Sim, Remover Professor"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (teacherToDelete) {
            onDeleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        onCancel={() => setTeacherToDelete(null)}
      />
    </div>
  );
};
