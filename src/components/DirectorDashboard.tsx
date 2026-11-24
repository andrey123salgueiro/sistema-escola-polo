import React, { useState } from 'react';
import { PreCouncilReport, User } from '../types';
import {
  Archive,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Trash2,
  FileCheck,
  Building,
  GraduationCap,
  Sparkles,
  Download,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface DirectorDashboardProps {
  reports: PreCouncilReport[];
  teachers: User[];
  onOpenReport: (report: PreCouncilReport) => void;
  onPrintReport: (report: PreCouncilReport) => void;
  onDeleteReport: (reportId: string) => void;
  onDeleteMultipleReports?: (reportIds: string[]) => void;
  onQuickSign: (reportId: string, signatureType: 'diretora' | 'pedagoga') => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  reports,
  teachers,
  onOpenReport,
  onPrintReport,
  onDeleteReport,
  onDeleteMultipleReports,
  onQuickSign,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedBimester, setSelectedBimester] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'signed' | 'unfilled'>('all');
  const [reportToDelete, setReportToDelete] = useState<PreCouncilReport | null>(null);
  const [showClearUnfilledConfirm, setShowClearUnfilledConfirm] = useState(false);

  // Archived reports (submitted or signed) vs unreleased/unfilled reports (pendente or rascunho)
  const archivedReports = reports.filter((r) => r.status === 'enviado' || r.status === 'visto');
  const unfilledReports = reports.filter((r) => r.status === 'pendente' || r.status === 'rascunho');
  const notStartedCount = unfilledReports.filter((r) => r.status === 'pendente').length;
  const draftCount = unfilledReports.filter((r) => r.status === 'rascunho').length;

  // Statistics
  const totalReports = archivedReports.length;
  const pendingDirectorReview = archivedReports.filter((r) => !r.diretoraSignature?.signed).length;
  const fullySigned = archivedReports.filter((r) => r.diretoraSignature?.signed).length;

  // Unique lists for filters
  const baseForClassList = statusFilter === 'unfilled' ? unfilledReports : archivedReports;
  const classesList = Array.from(new Set(baseForClassList.map((r) => r.classGroup))).sort();

  const sourceList = statusFilter === 'unfilled' ? unfilledReports : archivedReports;

  // Filtered reports
  const filteredReports = sourceList.filter((r) => {
    if (selectedClass !== 'all' && r.classGroup !== selectedClass) return false;
    if (selectedTeacher !== 'all' && r.teacherId !== selectedTeacher) return false;
    if (selectedBimester !== 'all' && r.bimester !== selectedBimester) return false;

    if (statusFilter === 'pending' && r.diretoraSignature?.signed) return false;
    if (statusFilter === 'signed' && !r.diretoraSignature?.signed) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchMeta =
        r.teacherName.toLowerCase().includes(q) ||
        r.classGroup.toLowerCase().includes(q) ||
        r.component.toLowerCase().includes(q) ||
        r.bimester.toLowerCase().includes(q);

      // Also search through the teacher's answers (e.g., student names mentioned)
      const matchAnswers = Object.values(r.answers || {}).some(
        (ans) => typeof ans === 'string' && ans.toLowerCase().includes(q)
      );

      if (!matchMeta && !matchAnswers) return false;
    }

    return true;
  });

  // Export summary to CSV
  const handleExportCSV = () => {
    const headers = ['Turma', 'Componente', 'Professor', 'Data', 'Trimestre', 'Status', 'Visto Diretoria'];
    const rows = filteredReports.map((r) => [
      `"${r.classGroup}"`,
      `"${r.component}"`,
      `"${r.teacherName}"`,
      `"${r.date}"`,
      `"${r.bimester}"`,
      `"${r.status === 'pendente' ? 'Não Preenchida' : r.status === 'rascunho' ? 'Em Rascunho' : r.status}"`,
      `"${r.diretoraSignature?.signed ? 'Homologado' : r.status === 'pendente' || r.status === 'rascunho' ? 'Aguardando Envio' : 'Pendente'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorios_pre_conselho_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title & Institutional Intro */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-stone-900">
              Arquivo Digital & Organização de Pré-Conselho
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Centralização automática das fichas preenchidas pelos professores do Colégio Estadual Unidade Polo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            title="Exportar listagem em planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Planilha (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`text-left bg-white p-4 rounded-xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'border-stone-400 ring-1 ring-stone-300'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total de Fichas Arquivadas
            </p>
            <p className="text-2xl font-black text-stone-900">{totalReports}</p>
            <p className="text-[11px] text-stone-600">
              {archivedReports.length > 0
                ? `${Array.from(new Set(archivedReports.map((r) => r.classGroup))).length} turmas com envio`
                : 'Nenhum envio registrado'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'unfilled' ? 'all' : 'unfilled')}
          className={`text-left bg-white p-4 rounded-xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
            statusFilter === 'unfilled'
              ? 'border-rose-400 ring-2 ring-rose-200'
              : 'border-stone-200 hover:border-rose-300'
          }`}
          title="Clique para visualizar as fichas soltas ainda não preenchidas pelos professores"
        >
          <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Fichas Não Preenchidas
            </p>
            <p className="text-2xl font-black text-rose-700">{unfilledReports.length}</p>
            <p className="text-[11px] text-rose-600 font-medium">
              {notStartedCount} pendente(s) · {draftCount} rascunho(s)
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`text-left bg-white p-4 rounded-xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-400 ring-2 ring-amber-200'
              : 'border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Aguardando Visto da Direção
            </p>
            <p className="text-2xl font-black text-amber-800">{pendingDirectorReview}</p>
            <p className="text-[11px] text-amber-700 font-medium">
              Necessitam leitura e homologação
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'signed' ? 'all' : 'signed')}
          className={`text-left bg-white p-4 rounded-xl border shadow-xs flex items-center gap-4 transition-all cursor-pointer ${
            statusFilter === 'signed'
              ? 'border-emerald-400 ring-2 ring-emerald-200'
              : 'border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Homologadas com Visto
            </p>
            <p className="text-2xl font-black text-emerald-700">{fullySigned}</p>
            <p className="text-[11px] text-emerald-600">Prontas para o Conselho de Classe</p>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por professor, aluno citado, conteúdo ou turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Turma Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todas as Turmas</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Professor Filter */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full md:w-52 lg:w-56 max-w-full truncate bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os Professores</option>
            {teachers.map((t) => {
              const subList =
                t.subjects && t.subjects.length > 0
                  ? t.subjects
                  : t.subject
                    ? t.subject
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];
              const subSummary =
                subList.length > 1
                  ? `${subList[0]} +${subList.length - 1}`
                  : subList[0] || 'Docente';
              return (
                <option key={t.id} value={t.id}>
                  {t.name} ({subSummary})
                </option>
              );
            })}
          </select>

          {/* Trimestre Filter */}
          <select
            value={selectedBimester}
            onChange={(e) => setSelectedBimester(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os Trimestres</option>
            <option value="1º Trimestre">1º Trimestre</option>
            <option value="2º Trimestre">2º Trimestre</option>
            <option value="3º Trimestre">3º Trimestre</option>
          </select>
        </div>

        {/* Active search summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
          <span>
            {statusFilter === 'unfilled' ? (
              <>
                Exibindo <strong>{filteredReports.length}</strong> de {unfilledReports.length} fichas soltas ainda não enviadas pelos professores
              </>
            ) : (
              <>
                Exibindo <strong>{filteredReports.length}</strong> de {totalReports} fichas arquivadas
              </>
            )}
          </span>

          <div className="flex items-center gap-3">
            {statusFilter === 'unfilled' && unfilledReports.length > 0 && onDeleteMultipleReports && (
              <button
                type="button"
                onClick={() => setShowClearUnfilledConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Todas Não Preenchidas ({unfilledReports.length})</span>
              </button>
            )}

            {(searchTerm || selectedClass !== 'all' || selectedTeacher !== 'all' || selectedBimester !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('all');
                  setSelectedTeacher('all');
                  setSelectedBimester('all');
                  setStatusFilter('all');
                }}
                className="text-amber-700 hover:text-amber-800 text-[11px] font-semibold underline cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table / List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
          <Archive className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">
            Nenhuma ficha encontrada no arquivo
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Verifique os filtros selecionados ou aguarde o envio das fichas digitais pelos professores cadastrados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Turma / Período</th>
                  <th className="py-3.5 px-4">Componente Curricular</th>
                  <th className="py-3.5 px-4">Professor(a)</th>
                  <th className="py-3.5 px-4">
                    {statusFilter === 'unfilled' ? 'Data da Liberação' : 'Data de Envio'}
                  </th>
                  <th className="py-3.5 px-4">
                    {statusFilter === 'unfilled' ? 'Situação' : 'Visto da Direção'}
                  </th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredReports.map((report) => {
                  const isSigned = report.diretoraSignature?.signed;
                  const isUnfilled = report.status === 'pendente' || report.status === 'rascunho';

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenReport(report)}
                    >
                      {/* Turma & Bimestre */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isUnfilled ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          {report.classGroup}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium">
                          {report.bimester}
                        </div>
                      </td>

                      {/* Componente */}
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {report.component}
                      </td>

                      {/* Professor */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">{report.teacherName}</div>
                        <div className="text-[10px] text-stone-400">ID: {report.teacherId}</div>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-4 text-stone-600">
                        {report.date ? report.date.split('-').reverse().join('/') : '-'}
                      </td>

                      {/* Visto Status / Situação */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {report.status === 'pendente' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            Não Preenchida
                          </span>
                        ) : report.status === 'rascunho' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                            <FileText className="w-3 h-3" />
                            Em Rascunho
                          </span>
                        ) : isSigned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            Visto Registrado
                          </span>
                        ) : (
                          <button
                            onClick={() => onQuickSign(report.id, 'diretora')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                            title="Aprovar e homologar visto da direção rapidamente"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Assinar Visto</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onOpenReport(report)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Ler ficha detalhada"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ler</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrintReport(report)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors inline-flex cursor-pointer"
                          title="Imprimir formato oficial da folha"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportToDelete(report)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex cursor-pointer"
                          title="Excluir relatório"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Report Deletion */}
      <ConfirmDialog
        isOpen={!!reportToDelete}
        title="Excluir Ficha do Arquivo"
        message={`Deseja realmente excluir permanentemente a ficha de ${reportToDelete?.classGroup} (${reportToDelete?.component} - ${reportToDelete?.teacherName})?`}
        confirmText="Sim, Excluir Ficha"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (reportToDelete) {
            onDeleteReport(reportToDelete.id);
            setReportToDelete(null);
          }
        }}
        onCancel={() => setReportToDelete(null)}
      />

      {/* Confirmation Modal for Clearing All Unfilled Reports */}
      <ConfirmDialog
        isOpen={showClearUnfilledConfirm}
        title="Limpar Fichas Não Preenchidas"
        message={`Deseja excluir todas as ${unfilledReports.length} fichas pendentes/em rascunho que ainda não foram enviadas pelos professores?`}
        confirmText="Sim, Limpar Todas"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (onDeleteMultipleReports) {
            onDeleteMultipleReports(unfilledReports.map((r) => r.id));
          }
          setShowClearUnfilledConfirm(false);
          setStatusFilter('all');
        }}
        onCancel={() => setShowClearUnfilledConfirm(false)}
      />
    </div>
  );
};
