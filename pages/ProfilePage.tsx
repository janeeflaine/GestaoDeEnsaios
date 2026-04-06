import React from 'react';
import {
  User,
  Phone,
  Music,
  MapPin,
  Camera,
  CheckCircle,
  LogOut,
  Info,
  UserPlus,
} from 'lucide-react';
import type { UserProfile, Congregation } from '../types';
import { INSTRUMENTS } from '../types';

interface FormData {
  name: string;
  phone: string;
  instrument: string;
  congregation: string;
  congregationId: string;
  photoUrl: string;
}

interface ProfilePageProps {
  userProfile: UserProfile | null;
  isGuest: boolean;
  setIsGuest: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  showSuccess: boolean;
  congregations: Congregation[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSaveProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  isGuest,
  setIsGuest,
  formData,
  setFormData,
  showSuccess,
  congregations,
  fileInputRef,
  onSaveProfile,
  onLogout,
  onFileSelect,
}) => {
  return (
    <div className="px-4 mt-8 space-y-8 animate-in slide-in-from-top-4 duration-500 max-w-2xl mx-auto pb-12">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Meu Perfil</h1>
        <p className="text-slate-500 font-medium">
          Mantenha seus dados atualizados para sincronização automática.
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-indigo-600 flex flex-col items-center gap-4 relative">
          {isGuest && (
            <div className="absolute top-4 right-4 animate-bounce">
              <button
                onClick={() => setIsGuest()}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-4 py-2 rounded-full border border-white/20 backdrop-blur-md uppercase tracking-widest flex items-center gap-2"
              >
                <UserPlus size={12} /> Criar Conta
              </button>
            </div>
          )}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 overflow-hidden shadow-2xl">
              {userProfile?.photoUrl ? (
                <img src={userProfile.photoUrl} className="w-full h-full object-cover" alt="Foto" />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
            <button
              type="button"
              disabled={isGuest}
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-2 -right-2 bg-white text-indigo-600 p-2.5 rounded-xl shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-indigo-600 group-hover:rotate-12 ${
                isGuest ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <Camera size={18} strokeWidth={2.5} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold tracking-tight leading-none">
              {isGuest ? 'Visualizando como Visitante' : userProfile?.name || 'Seu Nome'}
            </h2>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-1">
              {isGuest ? 'Acesso Limitado' : userProfile?.instrument || 'Instrumento'}
            </p>
          </div>
        </div>

        <form
          onSubmit={onSaveProfile}
          className={`p-8 space-y-6 ${isGuest ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isGuest && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 mb-4">
              <Info className="text-amber-500" size={20} />
              <p className="text-xs font-medium text-amber-700">
                Como visitante, suas edições no perfil não serão salvas.{' '}
                <button onClick={() => setIsGuest()} className="underline font-black">
                  Crie uma conta
                </button>{' '}
                para gerenciar seu perfil musical.
              </p>
            </div>
          )}

          {showSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 mb-4 animate-in slide-in-from-top-2">
              <CheckCircle className="text-emerald-500" size={20} />
              <p className="text-xs font-bold text-emerald-700">Perfil atualizado com sucesso!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <User size={14} /> Nome Completo
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                type="text"
                placeholder="Como quer ser chamado?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Phone size={14} /> WhatsApp
              </label>
              <input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                type="tel"
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Music size={14} /> Instrumento Principal
              </label>
              <select
                disabled={userProfile?.role !== 'MUSICIAN' && userProfile?.role !== 'ADMIN'}
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {INSTRUMENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {userProfile?.role !== 'MUSICIAN' && userProfile?.role !== 'ADMIN' && (
                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1">
                  <Info size={10} /> Solicite ao administrador para alterar seu instrumento
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <MapPin size={14} /> Congregação Comum
              </label>
              <select
                value={formData.congregationId}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = congregations.find((c) => c.id === id);
                  setFormData({
                    ...formData,
                    congregationId: id,
                    congregation: selected ? selected.name : '',
                  });
                }}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="">Selecione sua congregação...</option>
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Camera size={14} /> URL da Foto de Perfil
            </label>
            <input
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              type="text"
              placeholder="https://link-da-sua-foto.jpg ou Upload..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {!isGuest && (
              <button
                type="submit"
                disabled={showSuccess}
                className={`flex-1 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
                  showSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {showSuccess ? 'Perfil Salvo!' : 'Salvar Perfil'}
                <CheckCircle size={20} className={showSuccess ? 'animate-bounce' : ''} />
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-6 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2 font-black text-xs"
            >
              <LogOut size={18} /> {isGuest ? 'SAIR DO MODO VISITANTE' : 'SAIR DA CONTA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
