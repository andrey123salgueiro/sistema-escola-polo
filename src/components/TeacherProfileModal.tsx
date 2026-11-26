import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  getTeacherClasses,
  getTeacherSubjects,
} from '../utils/teacherUtils';
import {
  X,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  BookOpen,
  Layers,
} from 'lucide-react';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSaveProfile: (updatedUser: User) => Promise<void> | void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSaveProfile,
}) => {
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentUser.email || '');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const teacherSubjects = getTeacherSubjects(currentUser);
  const teacherClasses = getTeacherClasses(currentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError(
        'Por favor, informe um endereço de e-mail completo válido (ex: seu.nome@gmail.com ou @escola.pr.gov.br).'
      );
      return;
    }

    const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);
    const duplicateEmail = otherUsers.some(
      (u) => (u.email || '').trim().toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      setError('Este e-mail já está vinculado a outro usuário cadastrado no sistema.');
      return;
    }

    if (cleanNewPass || cleanConfirmPass) {
      if (cleanNewPass.length < 3) {
        setError('A nova senha deve ter pelo menos 3 caracteres.');
        return;
      }
      if (cleanNewPass !== cleanConfirmPass) {
        setError('A confirmação de senha não confere com a nova senha digitada.');
        return;
      }
    }

    const finalPassword = cleanNewPass || currentUser.password || '123';

    setIsSaving(true);
    try {
      await onSaveProfile({
        ...currentUser,
        email: cleanEmail,
        password: finalPassword,
      });
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar perfil do professor:', err);
      setError('Não foi possível salvar suas alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-profile-title"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="teacher-profile-title" className="text-base font-bold text-white">
                Meu Acesso — Professor(a)
              </h2>
              <p className="text-xs text-slate-300">
                Altere seu Gmail / e-mail de login e sua senha pessoal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Read-only Teacher Registration Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Docente Cadastrado
              </span>
              <span className="text-[11px] text-slate-500">
                Matérias e turmas gerenciadas pela Direção
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
            {(teacherSubjects.length > 0 || teacherClasses.length > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                {teacherSubjects.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <BookOpen className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span className="truncate max-w-[340px]">
                      {teacherSubjects.join(', ')}
                    </span>
                  </span>
                )}
                {teacherClasses.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                    <Layers className="w-3 h-3 text-amber-700 shrink-0" />
                    <span className="truncate max-w-[340px]">
                      {teacherClasses.join(', ')}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Email / Gmail Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seu E-mail / Gmail de Acesso *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                id="input-teacher-profile-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@gmail.com ou @escola.pr.gov.br"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Este é o e-mail completo que você usará para entrar no sistema (pode ser o seu Gmail pessoal ou o @escola.pr.gov.br).
            </p>
          </div>

          {/* Password Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Alterar Senha de Acesso (Opcional)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Preencha os campos abaixo apenas se desejar definir uma nova senha.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="input-teacher-profile-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Manter senha atual"
                    className="w-full pl-8 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="input-teacher-profile-password-confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-8 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-teacher-profile"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-60 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
