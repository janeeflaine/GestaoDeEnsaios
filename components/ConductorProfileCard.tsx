import React from 'react';
import { MapPin, User, Edit2, Trash2 } from 'lucide-react';
import { Encarregado, ConductorType } from '../types';

const ConductorProfileCard: React.FC<{ conductor: Encarregado; onEdit: () => void; onDelete: () => void }> = ({ conductor, onEdit, onDelete }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-start gap-4">
            <div className="relative">
                <img
                    src={conductor.photoUrl || 'https://via.placeholder.com/100'}
                    alt={conductor.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all"
                />
                <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white ${conductor.type === ConductorType.REGIONAL ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                    {conductor.type}
                </span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 leading-tight">{conductor.name}</h4>
                <p className="text-xs text-slate-400 font-medium mb-2">{conductor.instrument}</p>

                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium uppercase tracking-tight">
                        <MapPin size={10} className="text-indigo-400" /> {conductor.congregation}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium uppercase tracking-tight">
                        <User size={10} className="text-indigo-400" /> {conductor.age} Anos
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
);

export default ConductorProfileCard;
