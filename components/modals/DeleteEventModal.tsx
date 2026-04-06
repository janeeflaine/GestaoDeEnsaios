import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import type { RehearsalEvent } from '../../types';

interface DeleteEventModalProps {
  event: RehearsalEvent;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-red-600 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Confirmar Exclusão</h3>
          <p className="text-white/80 text-sm mt-2">
            Deseja realmente excluir este evento? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="p-8 space-y-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-slate-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{event.location}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {event.day} {event.month} • {event.time}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onConfirm}
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              EXCLUIR AGORA
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
