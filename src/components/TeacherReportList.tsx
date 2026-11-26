import React, { useState } from 'react';
import { PreCouncilReport, SchoolClass, SchoolSubject, User } from '../types';
import {
  AVAILABLE_SUBJECTS,
  REPORT_TITLE,
  SCHOOL_NAME,
  SCHOOL_SUBTITLE,
} from '../data/initialData';
import {
  getTeacherClasses,
  getTeacherSubjects,
  getTeacherSubjectsForClass,
  isUnassignedReportComponent,
  normalizeTeacherText,
} from '../utils/teacherUtils';
import {
  Eye,
  Edit,
  Layers,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  Lock,
  PlusCircle,
  UserCog,
} from 'lucide-react';

interface TeacherReportListProps {
  currentUser: User;
  reports: PreCouncilReport[];
  classes?: SchoolClass[];
  subjects?: SchoolSubject[];
  onOpenReport: (report: PreCouncilReport) => void;
  onEditReport?: (report: PreCouncilReport) => void;
  onFillReport?: (report: PreCouncilReport) => void;
  onPrintReport?: (report: PreCouncilReport) => void;
  onDeleteReport?: (reportId: string) => void;
  onStartNewReport?: () => void;
  onOpenProfile?: () => void;
}

export const TeacherReportList: React.FC<TeacherReportListProps> = ({
  currentUser,
  reports,
  subjects = [],
  onOpenReport,
  onEditReport,
  onFillReport,
  onPrintReport,
  onOpenProfile,
}) => {
  const handleEdit = onEditReport || onFillReport;
  const handlePrint = onPrintReport || onOpenReport;
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedBimester, setSelectedBimester] = useState<string>('all');
  const [selectedSubjectByReport, setSelectedSubjectByReport] = useState<
    Record<string, string>
  >({});
  const [subjectErrorReportId, setSubjectErrorReportId] = useState<string | null>(null);

  const teacherClasses = getTeacherClasses(currentUser);
  const teacherSubjects = getTeacherSubjects(currentUser);
  const allSchoolSubjectNames =
    subjects.length > 0 ? subjects.map((s) => s.name) : AVAILABLE_SUBJECTS;

  // Filter reports only for this teacher (and for pending/draft, keep aligned with teacher's assigned classes when defined)
  const teacherReports = reports.filter((r) => {
    if (r.teacherId !== currentUser.id) return false;
    if (
      (r.status === 'pendente' || r.status === 'rascunho') &&
      teacherClasses.length > 0 &&
      !teacherClasses.includes(r.classGroup)
    ) {
      return false;
    }
    return true;
  });

  const classFilterOptions = Array.from(
    new Set([
      ...teacherClasses,
      ...teacherReports.map((r) => r.classGroup),
    ])
  ).filter(Boolean);

  const subjectFilterOptions = Array.from(
    new Set([
      ...teacherSubjects,
      ...teacherReports
        .map((r) => r.component)
        .filter((comp) => !isUnassignedReportComponent(comp, allSchoolSubjectNames)),
    ])
  ).filter(Boolean);

  const filtered = teacherReports.filter((r) => {
    if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
    if (
      selectedSubjectFilter !== 'all' &&
      normalizeTeacherText(r.component) !== normalizeTeacherText(selectedSubjectFilter)
    ) {
      return false;
    }
    if (selectedBimester !== 'all' && r.bimester !== selectedBimester) return false;
    return true;
  });

  // Split into pending/draft vs submitted/signed
  const pendingReports = filtered.filter(
    (r) => r.status === 'pendente' || r.status === 'rascunho'
  );
  const submittedReports = filtered.filter(
    (r) => r.status === 'enviado' || r.status === 'visto'
  );

  const getInitialCardSubject = (report: PreCouncilReport): string => {
    if (selectedSubjectByReport[report.id] !== undefined) {
      return selectedSubjectByReport[report.id];
    }
    if (!isUnassignedReportComponent(report.component, allSchoolSubjectNames)) {
      return report.component;
    }
    const classSubjects = getTeacherSubjectsForClass(currentUser, report.classGroup);
    if (classSubjects.length === 1) {
      return classSubjects[0];
    }
    return '';
  };

  const handleOpenPendingReport = (report: PreCouncilReport) => {
    const chosenSubject = getInitialCardSubject(report);
    const classSubjects = getTeacherSubjectsForClass(currentUser, report.classGroup);
    const hasMultipleSubjects = classSubjects.length > 1;
    const isUnassigned = isUnassignedReportComponent(
      chosenSubject,
      allSchoolSubjectNames
    );

    if ((hasMultipleSubjects || isUnassigned) && !chosenSubject) {
      setSubjectErrorReportId(report.id);
      return;
    }

    setSubjectErrorReportId(null);
    const reportWithSubject: PreCouncilReport = {
      ...report,
      component: chosenSubject || report.component,
    };

    if (handleEdit) {
      handleEdit(reportWithSubject);
    } else {
      onOpenReport(reportWithSubject);
    }
  };

  const handleStartExtraSubjectForClass = (
    baseReport: PreCouncilReport,
    nextSubject: string
  ) => {
    if (!handleEdit) return;
    const newReport: PreCouncilReport = {
      id: `rep-extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      schoolName: SCHOOL_NAME,
      schoolSubtitle: SCHOOL_SUBTITLE,
      title: REPORT_TITLE,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      component: nextSubject,
      classGroup: baseReport.classGroup,
      date: new Date().toISOString().split('T')[0],
      bimester: baseReport.bimester,
      answers: {},
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedagogaSignature: { signed: false },
      diretoraSignature: { signed: false },
    };
    handleEdit(newReport);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-stone-900">
              Minhas Fichas de Pré-Conselho
            </h2>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline" aria-hidden="true">/</span>
            <span className="text-xs text-stone-600 font-medium">
              Docente: {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Fichas pedagógicas disponibilizadas pela Diretoria para cada turma e trimestre em que você leciona.
          </p>
          {(teacherClasses.length > 0 || teacherSubjects.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
              {teacherSubjects.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  <BookOpen className="w-3 h-3 text-emerald-700" />
                  Matérias: {teacherSubjects.join(', ')}
                </span>
              )}
              {teacherClasses.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                  <Layers className="w-3 h-3 text-amber-700" />
                  Suas Turmas: {teacherClasses.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {onOpenProfile && (
            <button
              type="button"
              id="btn-dashboard-teacher-profile"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
              title="Alterar meu e-mail (Gmail) e senha de acesso"
            >
              <UserCog className="w-3.5 h-3.5 text-amber-700" />
              <span>Alterar Meu E-mail / Senha</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-lg">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Acesso atual: {currentUser.email}</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs shadow-xs">
        <span className="font-semibold text-stone-700">Filtrar por:</span>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
          aria-label="Filtrar fichas por turma"
        >
          <option value="all">Todas as Minhas Turmas</option>
          {classFilterOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {subjectFilterOptions.length > 1 && (
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
            aria-label="Filtrar fichas por matéria"
          >
            <option value="all">Todas as Minhas Matérias</option>
            {subjectFilterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <select
          value={selectedBimester}
          onChange={(e) => setSelectedBimester(e.target.value)}
          className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
          aria-label="Filtrar fichas por trimestre"
        >
          <option value="all">Todos os Trimestres</option>
          <option value="1º Trimestre">1º Trimestre</option>
          <option value="2º Trimestre">2º Trimestre</option>
          <option value="3º Trimestre">3º Trimestre</option>
        </select>

        <span className="ml-auto text-stone-600 font-medium text-[11px]">
          Total: {filtered.length} {filtered.length === 1 ? 'ficha atribuída' : 'fichas atribuídas'}
        </span>
      </div>

      {/* SECTION 1: PENDING / AVAILABLE FOR FILLING */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Fichas Liberadas para Preenchimento ({pendingReports.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Aguardando suas respostas
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800 mb-1">
              Nenhuma ficha pendente no momento!
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Todas as fichas liberadas pela Direção para suas turmas já foram preenchidas e enviadas, ou a Diretora ainda não abriu uma nova rodada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((report) => {
              const isDraft = report.status === 'rascunho';
              const cardSubject = getInitialCardSubject(report);
              const classSubjects = getTeacherSubjectsForClass(
                currentUser,
                report.classGroup
              );
              const subjectChoicesForClass =
                classSubjects.length > 0 ? classSubjects : allSchoolSubjectNames;
              const needsSubjectPicker =
                classSubjects.length > 1 ||
                (isUnassignedReportComponent(report.component, allSchoolSubjectNames) &&
                  classSubjects.length !== 1);
              const hasSubjectError = subjectErrorReportId === report.id;

              const dropdownOptions = Array.from(
                new Set([
                  ...subjectChoicesForClass,
                  ...(!isUnassignedReportComponent(
                    report.component,
                    allSchoolSubjectNames
                  )
                    ? [report.component]
                    : []),
                ])
              );

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border-2 border-amber-300 hover:border-amber-400 p-5 shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        <Layers className="w-3.5 h-3.5 text-amber-700" />
                        {report.classGroup}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                          isDraft
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isDraft ? 'Rascunho em Andamento' : 'Disponibilizada pela Direção'}
                      </span>
                    </div>

                    {needsSubjectPicker ? (
                      <div className="mb-2">
                        <label
                          htmlFor={`select-subject-${report.id}`}
                          className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>Selecione a Matéria desta Turma *</span>
                        </label>
                        <select
                          id={`select-subject-${report.id}`}
                          value={cardSubject}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedSubjectByReport((prev) => ({
                              ...prev,
                              [report.id]: val,
                            }));
                            if (val && hasSubjectError) {
                              setSubjectErrorReportId(null);
                            }
                          }}
                          className={`w-full bg-stone-50 border rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 ${
                            hasSubjectError
                              ? 'border-red-500 ring-2 ring-red-200 bg-red-50/40'
                              : 'border-stone-300'
                          }`}
                        >
                          <option value="">-- Selecione a matéria da turma --</option>
                          {dropdownOptions.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                        {hasSubjectError && (
                          <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Escolha qual matéria você leciona nesta turma antes de abrir.</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        {cardSubject || report.component}
                      </h4>
                    )}

                    <div className="text-xs text-stone-600 space-y-1 my-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Trimestre:</span>
                        <span className="font-bold text-stone-800">{report.bimester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Data de Liberação:</span>
                        <span className="font-medium text-stone-700">
                          {report.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Call to Action */}
                  <div className="pt-3 border-t border-stone-100 mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPendingReport(report)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>
                        {isDraft ? 'Continuar Preenchimento da Ficha' : 'Preencher Ficha Agora'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: SUBMITTED / HOMOLOGATED REPORTS */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Fichas Enviadas à Direção ({submittedReports.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Arquivadas para o Conselho de Classe
          </span>
        </div>

        {submittedReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500 shadow-xs">
            Nenhuma ficha foi enviada ainda. Preencha e envie suas fichas pendentes acima.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedReports.map((report) => {
              const hasVisto =
                report.diretoraSignature?.signed || report.pedagogaSignature?.signed;

              // Find other subjects this teacher teaches in THIS class that don't yet have a report for this same class & bimester
              const classSubjects = getTeacherSubjectsForClass(
                currentUser,
                report.classGroup
              );
              const existingSubjectsForClassBimester = new Set(
                teacherReports
                  .filter(
                    (r) =>
                      r.classGroup === report.classGroup &&
                      r.bimester === report.bimester
                  )
                  .map((r) => normalizeTeacherText(r.component))
              );
              const remainingSubjects = classSubjects.filter(
                (sub) =>
                  !existingSubjectsForClassBimester.has(normalizeTeacherText(sub))
              );

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        <Layers className="w-3 h-3 text-stone-500" />
                        {report.classGroup}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasVisto
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {hasVisto ? 'Homologada / Com Visto' : 'Enviada à Direção'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-stone-400" />
                      {report.component}
                    </h4>

                    <div className="text-xs text-stone-600 space-y-1 my-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Trimestre:</span>
                        <span className="font-semibold text-stone-800">{report.bimester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Data de Envio:</span>
                        <span className="font-medium text-stone-700">
                          {report.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      {report.diretoraSignature?.signed && (
                        <div className="text-[11px] text-purple-800 pt-1 border-t border-stone-200 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          Visto da Diretora registrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onOpenReport(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Visualizar documento oficial"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar Ficha</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => (handlePrint ? handlePrint(report) : onOpenReport(report))}
                        className="flex items-center gap-1 px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        title="Imprimir / Exportar PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir</span>
                      </button>
                    </div>

                    {remainingSubjects.length > 0 && handleEdit && (
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-medium">
                          Preencher outra matéria nesta turma:
                        </span>
                        {remainingSubjects.map((remSub) => (
                          <button
                            key={remSub}
                            type="button"
                            onClick={() => handleStartExtraSubjectForClass(report, remSub)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3 text-amber-700" />
                            <span>{remSub}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
