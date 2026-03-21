import React, { useState, useMemo } from 'react';
import { X, ChevronRight, Plus, Music, Users, BookOpen, Hash } from 'lucide-react';
import { EventStatistic, Anciao, EncRegional, Congregation, STAT_INSTRUMENTS, MINISTRY_FIELDS, RehearsalEvent } from '../types';
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals, emptyStatistic } from '../utils/orchestraCalculations';
import { supabase } from '../supabaseClient';

interface StatisticsFormProps {
    congregations: Congregation[];
    events: RehearsalEvent[];
    anciaes: Anciao[];
    encRegionais: EncRegional[];
    onClose: () => void;
    onSaved: () => void;
    editingStat?: EventStatistic | null;
}

const FAMILY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
    cordas: { bg: 'bg-white/[0.02]', border: 'border-white/5 border-l-4 border-l-yellow-500', label: 'Cordas' },
    madeiras: { bg: 'bg-white/[0.02]', border: 'border-white/5 border-l-4 border-l-blue-500', label: 'Madeiras' },
    metais: { bg: 'bg-white/[0.02]', border: 'border-white/5 border-l-4 border-l-green-500', label: 'Metais' },
    acordeon: { bg: 'bg-white/[0.02]', border: 'border-white/5 border-l-4 border-l-slate-400', label: 'Acordeon' },
};

export default function StatisticsForm({
    congregations, events, anciaes, encRegionais,
    onClose, onSaved, editingStat
}: StatisticsFormProps) {
    const [stat, setStat] = useState<EventStatistic>(editingStat || emptyStatistic());
    const [selectedEncRegionais, setSelectedEncRegionais] = useState<number[]>([]);
    const [showAnciaoModal, setShowAnciaoModal] = useState(false);
    const [showEncModal, setShowEncModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const familyTotals = useMemo(() => calcFamilyTotals(stat), [stat]);
    const familyPct = useMemo(() => calcFamilyPercentages(familyTotals), [familyTotals]);
    const ministryTotals = useMemo(() => calcMinistryTotals(stat), [stat]);

    const updateField = (key: string, value: number) => {
        setStat(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = { ...stat };
        delete (payload as any).id;
        delete (payload as any).created_at;

        let error;
        if (editingStat?.id) {
            ({ error } = await supabase.from('event_statistics').update(payload).eq('id', editingStat.id));
        } else {
            const { data, error: insertError } = await supabase.from('event_statistics').insert(payload).select('id').single();
            error = insertError;
            if (!error && data) {
                for (const encId of selectedEncRegionais) {
                    await supabase.from('stat_enc_regionais').insert({ stat_id: data.id, enc_regional_id: encId });
                }
            }
        }

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            onSaved();
        }
        setSaving(false);
    };

    const handleAddAnciao = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const { error } = await supabase.from('anciaes').insert({ name: fd.get('name') as string });
        if (!error) { setShowAnciaoModal(false); onSaved(); }
    };

    const handleAddEnc = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const { error } = await supabase.from('enc_regionais').insert({
            name: fd.get('name') as string, city: fd.get('city') as string, state: fd.get('state') as string
        });
        if (!error) { setShowEncModal(false); onSaved(); }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-center font-semibold text-lg";
    const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5";

    const renderInstrumentGroup = (familyKey: string) => {
        const family = STAT_INSTRUMENTS[familyKey as keyof typeof STAT_INSTRUMENTS];
        const colors = FAMILY_COLORS[familyKey];
        return (
            <div key={familyKey} className={`${colors.bg} ${colors.border} border rounded-2xl p-5 space-y-3`}>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{colors.label}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {family.map(inst => (
                        <div key={inst.key} className="space-y-1 min-w-0">
                            <label className="text-[11px] text-slate-400 font-bold truncate block" title={inst.label}>{inst.label}</label>
                            <input
                                type="number" min="0"
                                value={(stat as any)[inst.key] || 0}
                                onChange={e => updateField(inst.key, parseInt(e.target.value) || 0)}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-start justify-center overflow-y-auto p-2 sm:p-4">
            <div className="glass-card bg-slate-900/95 w-full max-w-4xl my-4 sm:my-8 overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Cadastrar Dados do Evento</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Estatísticas Musicais</p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                        <X size={24} className="text-white" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-8 max-h-[85vh] sm:max-h-[75vh] overflow-y-auto overflow-x-hidden">
                    {/* SECTION 1: General Data */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={16} /> Dados Gerais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelClass}>Congregação</label>
                                <select value={stat.congregation_id || ''} onChange={e => setStat(p => ({ ...p, congregation_id: e.target.value }))} className={selectClass}>
                                    <option value="">Selecione...</option>
                                    {congregations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Data do Evento</label>
                                <input type="date" value={stat.event_date} onChange={e => setStat(p => ({ ...p, event_date: e.target.value }))} className={inputClass + ' text-left'} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    Presidência (Ancião)
                                    <button type="button" onClick={() => setShowAnciaoModal(true)} className="ml-auto text-indigo-400 hover:text-indigo-300"><Plus size={14} /></button>
                                </label>
                                <select value={stat.anciao_id || ''} onChange={e => setStat(p => ({ ...p, anciao_id: parseInt(e.target.value) || undefined }))} className={selectClass}>
                                    <option value="">Selecione...</option>
                                    {anciaes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Palavra</label>
                                <input type="text" placeholder="Ex: Salmos 32" value={stat.palavra || ''} onChange={e => setStat(p => ({ ...p, palavra: e.target.value }))} className={inputClass + ' text-left'} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}><Hash size={12} /> Hino de Abertura</label>
                                <input type="number" min="0" value={stat.hino_abertura || 0} onChange={e => setStat(p => ({ ...p, hino_abertura: parseInt(e.target.value) || 0 }))} className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}><Music size={12} /> Hinos Ensaiados</label>
                                <input type="number" min="0" value={stat.hinos_ensaiados || 0} onChange={e => setStat(p => ({ ...p, hinos_ensaiados: parseInt(e.target.value) || 0 }))} className={inputClass} />
                            </div>
                        </div>
                        {/* Enc. Regionais multi-select */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                Encarregado(s) Regional(is)
                                <button type="button" onClick={() => setShowEncModal(true)} className="ml-auto text-indigo-400 hover:text-indigo-300"><Plus size={14} /></button>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {encRegionais.map(enc => {
                                    const selected = selectedEncRegionais.includes(enc.id);
                                    return (
                                        <button key={enc.id} type="button"
                                            onClick={() => setSelectedEncRegionais(prev => selected ? prev.filter(id => id !== enc.id) : [...prev, enc.id])}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                        >
                                            {enc.name} {enc.city ? `(${enc.city}/${enc.state})` : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Orchestral Formation */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Music size={16} /> Formação Orquestral
                        </h3>
                        <div className="space-y-4">
                            {Object.keys(STAT_INSTRUMENTS).map(key => renderInstrumentGroup(key))}
                        </div>

                        {/* Live Calculation Summary */}
                        <div className="glass-card p-5 space-y-3">
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resumo por Família</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {([
                                    { label: 'Cordas', value: familyTotals.cordas, pct: familyPct.cordas, ideal: 50, color: 'text-yellow-400' },
                                    { label: 'Madeiras', value: familyTotals.madeiras, pct: familyPct.madeiras, ideal: 25, color: 'text-blue-400' },
                                    { label: 'Metais', value: familyTotals.metais, pct: familyPct.metais, ideal: 25, color: 'text-green-400' },
                                    { label: 'Acordeon', value: familyTotals.acordeon, pct: familyPct.acordeon, ideal: null, color: 'text-slate-400' },
                                ] as const).map(fam => (
                                    <div key={fam.label} className="bg-white/5 rounded-xl p-3 text-center">
                                        <p className={`text-2xl font-black ${fam.color}`}>{fam.value}</p>
                                        <p className="text-xs text-slate-400 font-bold">{fam.label}</p>
                                        <p className="text-xs mt-1">
                                            <span className={fam.color}>{fam.pct}%</span>
                                            {fam.ideal !== null && <span className="text-slate-600"> / {fam.ideal}% ideal</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center pt-2 border-t border-white/10">
                                <p className="text-3xl font-black text-white">{familyTotals.total}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total de Instrumentos</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Ministry */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} /> Ministério e Administração
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {MINISTRY_FIELDS.map(field => (
                                <div key={field.key} className="space-y-1 min-w-0">
                                    <label className="text-[11px] text-slate-400 font-bold truncate block" title={field.label}>{field.label}</label>
                                    <input
                                        type="number" min="0"
                                        value={(stat as any)[field.key] || 0}
                                        onChange={e => updateField(field.key, parseInt(e.target.value) || 0)}
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="glass-card p-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-black text-indigo-400">{ministryTotals.musicosOrganistas}</p>
                                <p className="text-xs text-slate-400 font-bold">Músicos + Organistas</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">{ministryTotals.totalGeral}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Geral</p>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : (editingStat ? 'Salvar Alterações' : 'Salvar Estatística')} <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Add Ancião Modal */}
            {showAnciaoModal && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
                    <div className="glass-card bg-slate-800 w-full max-w-sm p-6">
                        <h4 className="text-lg font-bold text-white mb-4">Cadastrar Ancião</h4>
                        <form onSubmit={handleAddAnciao} className="space-y-4">
                            <input name="name" required placeholder="Nome do Ancião" className={inputClass + ' text-left'} />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAnciaoModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add Enc. Regional Modal */}
            {showEncModal && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
                    <div className="glass-card bg-slate-800 w-full max-w-sm p-6">
                        <h4 className="text-lg font-bold text-white mb-4">Cadastrar Enc. Regional</h4>
                        <form onSubmit={handleAddEnc} className="space-y-4">
                            <input name="name" required placeholder="Nome" className={inputClass + ' text-left'} />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="city" placeholder="Cidade" className={inputClass + ' text-left'} />
                                <input name="state" placeholder="UF" maxLength={2} className={inputClass + ' text-left'} />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowEncModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
