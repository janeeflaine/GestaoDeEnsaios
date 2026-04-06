import React from 'react';
import { X, User, Briefcase, Music, Phone, Landmark, ChevronRight } from 'lucide-react';
import type { UserProfile, Congregation, UserRole } from '../../types';
import { INSTRUMENTS } from '../../types';

interface EditMemberModalProps {
  member: UserProfile;
  congregations: Congregation[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  congregations,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Editar Membro</h3>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
              Gestão Administrativa de Perfil
            </p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <User size={14} /> Nome Completo
            </label>
            <input
              name="name"
              required
              defaultValue={member.name}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Briefcase size={14} /> Nível de Acesso
              </label>
              <select
                name="role"
                defaultValue={member.role as unknown as UserRole}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              >
                <option value="USER">COMUM</option>
                <option value="MUSICIAN">MÚSICO</option>
                <option value="ADMIN">ADMINISTRADOR</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Music size={14} /> Instrumento
              </label>
              <select
                name="instrument"
                defaultValue={member.instrument}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              >
                {INSTRUMENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Phone size={14} /> WhatsApp
            </label>
            <input
              name="phone"
              defaultValue={member.phone}
              type="tel"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Landmark size={14} /> Congregação Comum
            </label>
            <select
              name="congregationId"
              defaultValue={member.congregationId || ''}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="">Selecione...</option>
              {congregations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700"
            >
              SALVAR ALTERAÇÕES <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
