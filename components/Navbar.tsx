import React from 'react';
import { Layout, List, User, Settings, Music } from 'lucide-react';
import { UserProfile } from '../types';

const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; user: UserProfile | null }> = ({ activeTab, setActiveTab, user }) => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 md:sticky md:top-0 md:border-b md:border-t-0 md:bg-white/90 md:backdrop-blur-md">
        <div className="hidden md:flex items-center gap-2 font-bold text-indigo-600 text-xl tracking-tighter">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Music size={18} /></div>
            Gestão de Ensaios 2026
        </div>
        {/* Logo version for mobile if needed, or simple centered name */}
        <div className="md:hidden flex items-center gap-2 font-black text-indigo-600 text-xs tracking-tighter absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
            <Music size={12} />
            Gestão 2026
        </div>
        <div className="flex gap-4 w-full justify-around md:w-auto md:justify-end">
            <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Layout size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
            </button>
            <button onClick={() => setActiveTab('events')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'events' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Eventos</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {user?.photoUrl ? (
                    <img src={user.photoUrl} className="w-5 h-5 rounded-full object-cover" alt="Perfil" />
                ) : (
                    <User size={20} />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
            </button>

            {user?.role === 'ADMIN' && (
                <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Settings size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                </button>
            )}
        </div>
    </nav>
);

export default Navbar;
