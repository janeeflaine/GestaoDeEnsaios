import React from 'react';
import { X, User, Music, Phone, ChevronRight } from 'lucide-react';
import type { RehearsalEvent, UserProfile, EventTypeDefinition } from '../../types';
import { INSTRUMENTS } from '../../types';
import { getTypeStyles, getFriendlyEventName } from '../../utils/eventHelpers';

interface PresenceModalProps {
  event: RehearsalEvent;
  userProfile: UserProfile | null;
  eventTypeList: EventTypeDefinition[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const PresenceModal: React.FC<PresenceModalProps> = ({
  event,
  userProfile,
  eventTypeList,
  onClose,
  onSubmit,
}) => {
  const styles = getTypeStyles(event.type, eventTypeList);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div
          className={`p-10 text-white flex justify-between items-center relative overflow-hidden ${styles.card}`}
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight">Confirmar Presença</h3>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
              {getFriendlyEventName(event.type)} • {event.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all relative z-10 active:scale-90"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-10 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
              <User size={14} /> Nome Completo
            </label>
            <input
              required
              name="name"
              defaultValue={userProfile?.name}
              type="text"
              placeholder="Seu nome completo"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                <Music size={14} /> Instrumento
              </label>
              <select
                name="instrument"
                defaultValue={userProfile?.instrument}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              >
                {INSTRUMENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                <Phone size={14} /> WhatsApp
              </label>
              <input
                name="phone"
                defaultValue={userProfile?.phone}
                type="tel"
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:scale-[1.02] ${styles.card}`}
          >
            Confirmar agora <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
