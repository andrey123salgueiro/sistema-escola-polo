import React, { useState } from 'react';
import { SchoolSubject, User } from '../types';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  Users,
  AlertCircle,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { getTeacherSubjects } from '../utils/teacherUtils';

interface SubjectManagementProps {
  subjects: SchoolSubject[];
  teachers: User[];
  onAddSubject: (newSubject: SchoolSubject) => void;
  onUpdateSubject: (subject: SchoolSubject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const KNOWLEDGE_AREAS = [
  'Linguagens e suas Tecnologias',
  'Matemática e suas Tecnologias',
  'Ciências da Natureza',
  'Ciências Humanas e Sociais',
  'Formação Técnica / Profissional',
  'Parte Diversificada / Projetos',
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  teachers,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<SchoolSubject | null>(null);

  const resetForm = () => {
    setName('');
    setArea('');
    setEditingSubjectId(null);
    setFormError(null);
    setShowForm(false);
  };

  const handleEdit = (sub: SchoolSubject) => {
    setName(sub.name);
    setArea(sub.area || '');
    setEditingSubjectId(sub.id);
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Por favor, informe o nome da matéria.');
      return;
    }

    const duplicate = subjects.some(
      (s) =>
        normalizeText(s.name) === normalizeText(cleanName) &&
        s.id !== editingSubjectId
    );
    if (duplicate) {
      setFormError(`Já existe uma matéria cadastrada com o nome "${cleanName}".`);
      return;
    }

    if (editingSubjectId) {
      const existing = subjects.find((s) => s.id === editingSubjectId);
      if (existing) {
        onUpdateSubject({
          ...existing,
          name: cleanName,
          area: area.trim() || undefined,
        });
        setFeedback(`Matéria "${cleanName}" atualizada com sucesso!`);
      }
    } else {
      const newSub: SchoolSubject = {
        id: `sub-${Date.now()}`,
        name: cleanName,
        area: area.trim() || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddSubject(newSub);
      setFeedback(`Matéria "${cleanName}" cadastrada com sucesso!`);
    }

    setTimeout(() => setFeedback(null), 4000);
    resetForm();
  };

  const getTeacherCountForSubject = (subjectName: string) => {
    const normTarget = normalizeText(subjectName);
    return teachers.filter((t) =>
      getTeacherSubjects(t).some((part) => normalizeText(part) === normTarget)
    ).length;
  };

  const filteredSubjects = subjects.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.area && s.area.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Cadastro e Gestão de Matérias
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre, organize ou exclua os componentes curriculares disponíveis para os professores e fichas de pré-conselho.
          </p>
        </div>

        {!showForm && (
          <button
            id="btn-add-subject"
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Nova Matéria</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add / Edit Subject Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              {editingSubjectId ? 'Editar Matéria' : 'Cadastrar Nova Matéria'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>

          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Matéria / Componente Curricular *
                </label>
                <input
                  type="text"
                  required
                  id="input-subject-name"
                  placeholder="Ex: Física, Química, Biologia, Sociologia, Programação..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>
            </div>

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
                id="btn-save-subject"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {editingSubjectId ? 'Salvar Alterações' : 'Cadastrar Matéria'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Count */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar matéria ou área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <span className="text-xs text-stone-500">
            Total: <strong>{filteredSubjects.length}</strong> matérias cadastradas
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">
              Nenhuma matéria encontrada
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Clique em "+ Cadastrar Nova Matéria" para adicionar uma disciplina.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredSubjects.map((sub) => {
              const teacherCount = getTeacherCountForSubject(sub.name);
              return (
                <div
                  key={sub.id}
                  className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{sub.name}</h4>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-stone-500">
                        {sub.area && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium">
                            <Tag className="w-3 h-3 text-stone-400" />
                            {sub.area}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-600">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          {teacherCount}{' '}
                          {teacherCount === 1 ? 'professor vinculado' : 'professores vinculados'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(sub)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Editar matéria"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubjectToDelete(sub)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/70 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Excluir matéria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deleting Subject */}
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        title="Excluir Matéria"
        message={
          subjectToDelete
            ? getTeacherCountForSubject(subjectToDelete.name) > 0
              ? `A matéria "${subjectToDelete.name}" está vinculada a ${getTeacherCountForSubject(subjectToDelete.name)} professor(es). Deseja realmente excluí-la da lista de matérias do sistema? (As fichas já enviadas não serão apagadas.)`
              : `Deseja realmente excluir a matéria "${subjectToDelete.name}" do sistema?`
            : ''
        }
        confirmText="Sim, Excluir Matéria"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (subjectToDelete) {
            onDeleteSubject(subjectToDelete.id);
            setFeedback(`Matéria "${subjectToDelete.name}" excluída com sucesso.`);
            setTimeout(() => setFeedback(null), 4000);
            setSubjectToDelete(null);
          }
        }}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
};
