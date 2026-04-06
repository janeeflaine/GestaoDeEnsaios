import React from 'react';
import { X, MapPin, List, User, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { RehearsalEvent, EventTypeDefinition } from '../../types';
import { MONTHS_PT } from '../../types';

interface EventModalProps {
  event: RehearsalEvent | null;
  creatingEventType: string;
  setCreatingEventType: (v: string) => void;
  congregationList: string[];
  eventTypeList: EventTypeDefinition[];
  uniqueConductors: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  creatingEventType,
  setCreatingEventType,
  congregationList,
  eventTypeList,
  uniqueConductors,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {event ? 'Editar Evento' : `Novo Evento ${new Date().getFullYear()}`}
            </h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {event ? 'Atualização de Agendamento' : 'Configuração do Cronograma'}
            </p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <MapPin size={14} /> Localização / Distrito
            </label>
            <select
              required
              name="location"
              defaultValue={event?.location}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="">Selecione o Local...</option>
              {congregationList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <List size={14} /> Tipo de Evento
            </label>
            <select
              name="type"
              value={creatingEventType}
              onChange={(e) => setCreatingEventType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="">Selecione...</option>
              {eventTypeList.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 transition-opacity opacity-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <User size={14} /> Encarregado
            </label>
            <select
              name="conductor"
              defaultValue={event?.conductor || 'Coletivo'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="Coletivo">Coletivo (Geral)</option>
              {uniqueConductors
                .filter((c) => c !== 'Todos')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Calendar size={14} /> Mês
            </label>
            <select
              name="month"
              defaultValue={event?.month}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            >
              {MONTHS_PT.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Dia (Número)
              </label>
              <input
                required
                name="day"
                defaultValue={event?.day.split(' ')[0]}
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Dia (Semana)
              </label>
              <select
                name="weekday"
                defaultValue={event?.day.split('(')[1]?.replace(')', '')}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              >
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Clock size={14} /> Horário
            </label>
            <input
              required
              name="time"
              defaultValue={event?.time}
              type="text"
              placeholder="Ex: 17:00h"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-900"
            >
              {event ? 'Salvar Alterações' : 'Salvar Novo Evento'} <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
