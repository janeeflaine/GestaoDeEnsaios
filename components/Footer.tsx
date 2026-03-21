import React from 'react';
import { Music, Info } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="mt-auto py-10 px-4 border-t border-slate-100 text-center space-y-3 bg-white">
        <div className="flex items-center justify-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 p-1 rounded-md text-white"><Music size={12} /></div>
            <span className="font-black text-sm tracking-tighter">Gestão de Ensaios 2026</span>
        </div>
        <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Info size={12} className="text-slate-300" /> Site Extraoficial
            </p>
            <p className="text-[9px] text-slate-300 font-medium">Desenvolvido para fins de organização interna. © {new Date().getFullYear()}</p>
        </div>
    </footer>
);

export default Footer;
