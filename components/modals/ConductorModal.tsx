import React from 'react';
import { X, User, Calendar, Music, MapPin, List, Camera, ChevronRight } from 'lucide-react';
import type { Encarregado } from '../../types';
import { INSTRUMENTS, ConductorType } from '../../types';

interface ConductorModalProps {
  conductor: Encarregado | null;
  congregationList: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ConductorModal: React.FC<ConductorModalProps> = ({
  conductor,
  congregationList,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {conductor ? 'Editar Perfil' : 'Novo Encarregado'}
            </h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
              Gestão de Perfis de Música
            </p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <User size={14} /> Nome do Encarregado
            </label>
            <input
              required
              name="name"
              defaultValue={conductor?.name}
              type="text"
              placeholder="Nome Completo"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Calendar size={14} /> Idade
            </label>
            <input
              required
              name="age"
              defaultValue={conductor?.age}
              type="number"
              placeholder="Anos"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Music size={14} /> Instrumento
            </label>
            <select
              name="instrument"
              defaultValue={conductor?.instrument}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              {INSTRUMENTS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <MapPin size={14} /> Congregação Comum
            </label>
            <select
              name="congregation"
              defaultValue={conductor?.congregation}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="">Selecione...</option>
              {congregationList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <List size={14} /> Tipo
            </label>
            <select
              name="type"
              defaultValue={conductor?.type || ConductorType.LOCAL}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value={ConductorType.LOCAL}>Local</option>
              <option value={ConductorType.REGIONAL}>Regional</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Camera size={14} /> URL da Foto (Opcional)
            </label>
            <input
              name="photoUrl"
              defaultValue={conductor?.photoUrl}
              type="url"
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700"
            >
              {conductor ? 'Salvar Alterações' : 'Cadastrar Perfil'} <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
