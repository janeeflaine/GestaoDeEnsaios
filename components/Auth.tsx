import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Music, ChevronRight, LogIn, UserPlus, ArrowLeft, Loader2, X } from 'lucide-react';
import { INSTRUMENTS } from '../types';

interface AuthProps {
    onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isMusician, setIsMusician] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [instrument, setInstrument] = useState(INSTRUMENTS[0]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            instrument: isMusician ? instrument : null,
                            role: isMusician ? 'MUSICIAN' : 'USER'
                        }
                    }
                });
                if (error) throw error;

                if (data.session) {
                    // Auto-login successful (Email confirmation is disabled)
                    return;
                } else {
                    // Email confirmation is required
                    alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta e poder fazer login.');
                }
            }
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-500 relative z-10 px-6 sm:px-10">
                <button type="button" onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-50">
                    <X size={20} />
                </button>
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h1>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2 px-4 italic leading-loose">
                        {isLogin ? 'Acesse o calendário e suas confirmações' : 'Junte-se ao cronograma musical 2026'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <User size={14} /> Nome Completo
                            </label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: João Silva"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium placeholder:text-white/20"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Mail size={14} /> E-mail
                        </label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@igreja.com.br"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium placeholder:text-white/20"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Lock size={14} /> Senha
                        </label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha secreta"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium placeholder:text-white/20"
                        />
                    </div>

                    {!isLogin && (
                        <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                            <div
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isMusician ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                                onClick={() => setIsMusician(!isMusician)}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${isMusician ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'}`}>
                                    {isMusician && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Sou Músico</p>
                                    <p className="text-[10px] text-white/40 font-bold leading-tight">Para confirmar presenças com seu instrumento</p>
                                </div>
                            </div>

                            {isMusician && (
                                <div className="mt-4 space-y-1.5 animate-in zoom-in-95 duration-200">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        <Music size={14} /> Qual seu instrumento?
                                    </label>
                                    <select
                                        value={instrument}
                                        onChange={(e) => setInstrument(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium appearance-none"
                                    >
                                        {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-slate-800">{i}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Entrar Agora' : 'Finalizar Cadastro'}
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 space-y-3">
                    {isLogin ? (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className="w-full bg-rose-600/20 text-rose-400 border border-rose-600/30 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-600/30 transition-all text-xs tracking-widest shadow-lg shadow-rose-900/20"
                            >
                                <UserPlus size={16} /> AINDA NÃO TEM CONTA? CADASTRE-SE AQUI
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className="w-full text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} /> JÁ TEM CONTA? VOLTAR PARA O LOGIN
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Check: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default Auth;
