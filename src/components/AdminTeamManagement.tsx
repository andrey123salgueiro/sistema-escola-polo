import React, { useState, useRef } from 'react';
import { User } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Search,
  CheckCircle,
  AlertCircle,
  Briefcase,
  UserCheck,
  Info,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminTeamManagementProps {
  adminUsers: User[];
  allUsers: User[];
  currentUser: User;
  onAddAdminUser: (newAdmin: User) => Promise<void> | void;
  onUpdateAdminUser: (updatedAdmin: User) => Promise<void> | void;
  onDeleteAdminUser: (adminId: string) => Promise<void> | void;
}

const POSITION_SUGGESTIONS = [
  'Direção Geral',
  'Direção Auxiliar',
  'Secretário',
  'Secretária',
  'Coordenador Técnico',
  'Coordenadora Técnica',
  'Pedagogo',
  'Pedagoga',
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function suggestUsername(fullName: string): string {
  const parts = normalizeText(fullName)
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[parts.length - 1]}`;
}

function suggestEmail(fullName: string): string {
  const slug = suggestUsername(fullName);
  return `${slug || 'equipe'}@escola.gov.br`;
}

export function isGeneralDirector(user?: User | null): boolean {
  if (!user || user.role !== 'diretora') return false;
  if (user.id === 'user-diretora') return true;
  return normalizeText(user.username || '') === 'admin';
}

export const AdminTeamManagement: React.FC<AdminTeamManagementProps> = ({
  adminUsers,
  allUsers,
  currentUser,
  onAddAdminUser,
  onUpdateAdminUser,
  onDeleteAdminUser,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Pedagogo(a)');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [emailEdited, setEmailEdited] = useState(false);
  const [password, setPassword] = useState('123');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Filters & Feedback
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const isMainDirector = isGeneralDirector(currentUser);

  const resetForm = () => {
    setName('');
    setPosition('Pedagogo(a)');
    setUsername('');
    setUsernameEdited(false);
    setEmail('');
    setEmailEdited(false);
    setPassword('123');
    setShowFormPassword(false);
    setEditingAdminId(null);
    setFormError(null);
    setShowForm(false);
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowForm(true);
    scrollToForm();
  };

  const handleStartEdit = (member: User) => {
    if (!isMainDirector && member.id !== currentUser.id) {
      setFeedbackMsg(
        'Somente a Direção Geral (Ana Paula) pode editar dados ou senhas de outros integrantes.'
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }

    setEditingAdminId(member.id);
    setName(member.name);
    setPosition(member.position || 'Direção / Equipe Gestora');
    setUsername(member.username || suggestUsername(member.name));
    setUsernameEdited(true);
    setEmail(member.email || suggestEmail(member.name));
    setEmailEdited(true);
    setPassword(member.password || '123');
    setShowFormPassword(false);
    setFormError(null);
    setShowForm(true);
    scrollToForm();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingAdminId) {
      if (!usernameEdited) {
        setUsername(suggestUsername(value));
      }
      if (!emailEdited) {
        setEmail(suggestEmail(value));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanPosition = position.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = (email.trim() || suggestEmail(cleanName)).toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setFormError('Por favor, informe o nome completo do membro.');
      return;
    }

    if (!cleanPosition) {
      setFormError('Por favor, informe o cargo ou função administrativa.');
      return;
    }

    if (!cleanUsername) {
      setFormError('Por favor, informe o usuário de login individual.');
      return;
    }

    if (cleanPassword.length < 3) {
      setFormError('A senha de acesso deve ter pelo menos 3 caracteres.');
      return;
    }

    const otherUsers = allUsers.filter((u) => u.id !== editingAdminId);
    const duplicateUsername = otherUsers.some(
      (u) => normalizeText(u.username || '') === normalizeText(cleanUsername)
    );
    if (duplicateUsername) {
      setFormError(
        `O usuário "${cleanUsername}" já está em uso por outro cadastro. Escolha um usuário diferente.`
      );
      return;
    }

    if (editingAdminId) {
      if (!isMainDirector && editingAdminId !== currentUser.id) {
        setFormError(
          'Somente a Direção Geral (Ana Paula) pode alterar os dados ou a senha de outro membro.'
        );
        return;
      }

      const existing = adminUsers.find((u) => u.id === editingAdminId);
      const updatedUser: User = {
        ...(existing || {
          id: editingAdminId,
          role: 'diretora',
          createdAt: new Date().toISOString().split('T')[0],
        }),
        name: cleanName,
        position: cleanPosition,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        role: 'diretora',
      };
      await onUpdateAdminUser(updatedUser);
      setFeedbackMsg(
        `Cadastro de ${cleanName} (${cleanPosition}) atualizado com sucesso!`
      );
    } else {
      const newAdmin: User = {
        id: `admin-${Date.now()}`,
        name: cleanName,
        position: cleanPosition,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        role: 'diretora',
        createdAt: new Date().toISOString().split('T')[0],
      };
      await onAddAdminUser(newAdmin);
      setFeedbackMsg(
        `Acesso criado para ${cleanName} (${cleanPosition}) — Usuário: ${cleanUsername}`
      );
    }

    resetForm();
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const uniquePositions = Array.from(
    new Set(adminUsers.map((u) => u.position?.trim()).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const filteredAdmins = adminUsers
    .filter((u) => {
      const normSearch = normalizeText(searchTerm);
      const matchesSearch =
        !normSearch ||
        normalizeText(u.name).includes(normSearch) ||
        normalizeText(u.username || '').includes(normSearch) ||
        normalizeText(u.position || '').includes(normSearch) ||
        normalizeText(u.email || '').includes(normSearch);

      const matchesPosition =
        filterPosition === 'all' || (u.position || '') === filterPosition;

      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Equipe Administrativa & Direção
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Gerencie usuários e senhas individuais para Direção, Secretaria, Coordenação Técnica e Pedagogia.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-new-admin-member"
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Cadastrar Membro da Equipe</span>
          </button>
        </div>

        {/* Helpful Info Box */}
        <div className="mt-5 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              {isMainDirector
                ? 'Acesso da Direção Geral ativo: você pode gerenciar acessos, senhas e exclusões de toda a equipe.'
                : 'Permissões da Equipe Administrativa: você pode editar seus próprios dados e senha.'}
            </p>
            <p className="text-[11px] text-amber-900/85">
              {isMainDirector
                ? 'Cada integrante entra na aba "Acesso Administrativo" com seu próprio usuário e senha. Apenas a Direção Geral pode editar senhas de outros membros ou remover acessos.'
                : 'Somente a Direção Geral (Ana Paula) possui permissão para visualizar ou alterar senhas de outros integrantes e excluir acessos.'}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div
          ref={formRef}
          className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold">
                {editingAdminId
                  ? 'Editar Acesso Administrativo'
                  : 'Novo Acesso Administrativo'}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  id="input-admin-name"
                  placeholder="Ex: Maria Luiza Marchi Gouvea"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Função *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="input-admin-position"
                    list="admin-position-options"
                    placeholder="Ex: Pedagoga, Secretário, Direção Auxiliar"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium"
                  />
                  <datalist id="admin-position-options">
                    {POSITION_SUGGESTIONS.map((pos) => (
                      <option key={pos} value={pos} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuário de Login *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="input-admin-username"
                    placeholder="ex: maria.luiza"
                    value={username}
                    onChange={(e) => {
                      setUsernameEdited(true);
                      setUsername(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="input-admin-email"
                    placeholder="nome@escola.gov.br"
                    value={email}
                    onChange={(e) => {
                      setEmailEdited(true);
                      setEmail(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Individual *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    id="input-admin-password"
                    placeholder="Mínimo 3 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showFormPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showFormPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-admin-member"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {editingAdminId ? 'Salvar Alterações' : 'Cadastrar Acesso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, usuário, cargo ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">Todos os cargos ({adminUsers.length})</option>
            {uniquePositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-5">Integrante</th>
                <th className="py-3.5 px-4">Cargo / Função</th>
                <th className="py-3.5 px-4">Usuário de Login</th>
                <th className="py-3.5 px-4">Senha</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAdmins.map((member) => {
                const isSelf = member.id === currentUser.id;
                const canViewPassword = isMainDirector || isSelf;
                const canEditMember = isMainDirector || isSelf;
                const canDelete =
                  isMainDirector &&
                  !isSelf &&
                  member.id !== 'user-diretora' &&
                  adminUsers.length > 1;
                const isPasswordVisible =
                  canViewPassword && Boolean(revealedPasswords[member.id]);
                const displayPassword = member.password || '123';

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelf ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">
                              {member.name}
                            </span>
                            {isSelf && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                <UserCheck className="w-3 h-3" />
                                Você
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span>{member.position || 'Equipe Gestora'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <code className="px-2 py-1 rounded-md bg-slate-100 text-slate-900 font-mono text-[11px] font-semibold border border-slate-200">
                        {member.username || 'admin'}
                      </code>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <code className="px-2 py-1 rounded-md bg-slate-50 text-slate-800 font-mono text-[11px] border border-slate-200 min-w-[64px] text-center">
                          {isPasswordVisible ? displayPassword : '••••••'}
                        </code>
                        {canViewPassword ? (
                          <button
                            type="button"
                            onClick={() => toggleRevealPassword(member.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-slate-300"
                            title="Senha protegida — apenas a Direção Geral (Ana Paula) pode visualizar"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={!canEditMember}
                          onClick={() => canEditMember && handleStartEdit(member)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                            canEditMember
                              ? 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200 cursor-pointer'
                              : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                          }`}
                          title={
                            canEditMember
                              ? 'Editar dados e senha'
                              : 'Somente a Direção Geral (Ana Paula) pode editar dados e senhas de outros membros'
                          }
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          disabled={!canDelete}
                          onClick={() => canDelete && setMemberToDelete(member)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                            canDelete
                              ? 'text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border-rose-200 cursor-pointer'
                              : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                          }`}
                          title={
                            !isMainDirector
                              ? 'Somente a Direção Geral (Ana Paula) pode excluir membros'
                              : isSelf
                              ? 'Você não pode excluir o próprio usuário conectado'
                              : member.id === 'user-diretora'
                              ? 'A conta principal da Direção Geral não pode ser excluída'
                              : adminUsers.length <= 1
                              ? 'Deve existir ao menos um administrador'
                              : 'Excluir acesso'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                    Nenhum integrante encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Remover Acesso Administrativo"
        message={`Tem certeza que deseja remover o acesso de "${memberToDelete?.name || ''}" (${
          memberToDelete?.position || 'Equipe'
        })? Essa pessoa não poderá mais entrar no painel administrativo.`}
        confirmText="Sim, Remover Acesso"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (memberToDelete) {
            await onDeleteAdminUser(memberToDelete.id);
            setFeedbackMsg(`Acesso de ${memberToDelete.name} removido.`);
            setTimeout(() => setFeedbackMsg(null), 4000);
          }
          setMemberToDelete(null);
        }}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
};
