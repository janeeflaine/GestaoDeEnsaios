import React, { useState, useMemo } from 'react';
import { X, ChevronRight, Plus, Music, Users, BookOpen, Hash, UserCheck } from 'lucide-react';
import { EventStatistic, Anciao, Encarregado, Congregation, STAT_INSTRUMENTS, MINISTRY_FIELDS, RehearsalEvent, UserRole } from '../types';
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals, emptyStatistic } from '../utils/orchestraCalculations';
import { supabase } from '../supabaseClient';
import { insertStatistic, updateStatistic } from '../services/statistics';
import { submitPendingAnciao } from '../services/anciaes';

interface StatisticsFormProps {
    congregations: Congregation[];
    events: RehearsalEvent[];
    anciaes: Anciao[];
    encRegionais: Encarregado[];
    onClose: () => void;
    /** Called after save. Receives the saved stat when in guest mode. */
    onSaved: (saved?: EventStatistic) => void;
    editingStat?: EventStatistic | null;
    isGuest?: boolean;
    userId?: string;
    userRole?: UserRole;
    userName?: string;
}

const FAMILY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
    cordas: { bg: 'bg-slate-50', border: 'border-slate-200 border-l-4 border-l-yellow-500', label: 'Cordas' },
    madeiras: { bg: 'bg-slate-50', border: 'border-slate-200 border-l-4 border-l-blue-500', label: 'Madeiras' },
    metais: { bg: 'bg-slate-50', border: 'border-slate-200 border-l-4 border-l-green-500', label: 'Metais' },
    acordeon: { bg: 'bg-slate-50', border: 'border-slate-200 border-l-4 border-l-slate-500', label: 'Acordeon' },
};

export default function StatisticsForm({
    congregations, events, anciaes, encRegionais: initialEncRegionais,
    onClose, onSaved, editingStat, isGuest = false, userId, userRole, userName,
}: StatisticsFormProps) {
    const isAdmin = userRole === UserRole.ADMIN;
    const encRegionais = initialEncRegionais;
    const [stat, setStat] = useState<EventStatistic>(() => {
        const base = editingStat || emptyStatistic();
        return base;
    });
    // Custom ancião name used locally (non-admin flow or editing a stat that had one)
    const [customAnciaoName, setCustomAnciaoName] = useState<string>(editingStat?.anciao_nome_custom || '');
    const [selectedEncRegionais, setSelectedEncRegionais] = useState<string[]>([]);
    const [showAnciaoModal, setShowAnciaoModal] = useState(false);
    const [showEncModal, setShowEncModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [ancipaoInput, setAnciaoInput] = useState('');
    const [hinosEnsaiadosList, setHinosEnsaiadosList] = useState<number[]>(() => {
        // On edit, we only have the count — can't reconstruct the list
        return [];
    });
    const [hinoInput, setHinoInput] = useState('');

    const familyTotals = useMemo(() => calcFamilyTotals(stat), [stat]);
    const familyPct = useMemo(() => calcFamilyPercentages(familyTotals), [familyTotals]);
    // Keep stat.musicos always in sync with the computed instrument total
    const statWithMusicos = useMemo(
        () => ({ ...stat, musicos: familyTotals.total }),
        [stat, familyTotals.total]
    );
    const ministryTotals = useMemo(() => calcMinistryTotals(statWithMusicos), [statWithMusicos]);

    const updateField = (key: string, value: number) => {
        setStat(prev => ({ ...prev, [key]: value }));
    };

    const addHino = () => {
        const n = parseInt(hinoInput.trim());
        if (!n || n <= 0) return;
        if (hinosEnsaiadosList.includes(n)) { setHinoInput(''); return; }
        const next = [...hinosEnsaiadosList, n].sort((a, b) => a - b);
        setHinosEnsaiadosList(next);
        setStat(prev => ({ ...prev, hinos_ensaiados: next.length }));
        setHinoInput('');
    };

    const removeHino = (n: number) => {
        const next = hinosEnsaiadosList.filter(h => h !== n);
        setHinosEnsaiadosList(next);
        setStat(prev => ({ ...prev, hinos_ensaiados: next.length }));
    };

    const handleHinoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            addHino();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Merge custom ancião name into payload
            const base = { ...statWithMusicos, anciao_nome_custom: customAnciaoName || undefined };

            // ── Guest mode: pass stat back to parent for sessionStorage ──
            if (isGuest) {
                const guestStat: EventStatistic = editingStat?.id
                    ? { ...base, id: editingStat.id }
                    : { ...base, id: crypto.randomUUID() };
                onSaved(guestStat);
                return;
            }

            // ── Authenticated mode ────────────────────────────────────────
            const { id: _id, created_at: _ca, ...payload } = base as EventStatistic & { id?: string; created_at?: string };

            if (editingStat?.id) {
                await updateStatistic(editingStat.id, payload);
                onSaved();
            } else {
                const saved = await insertStatistic({ ...payload, created_by: userId! });
                for (const encId of selectedEncRegionais) {
                    await supabase.from('stat_conductors').insert({ stat_id: saved.id, conductor_id: encId });
                }
                // If custom ancião was used by non-admin, submit notification to admins
                if (customAnciaoName && !isAdmin) {
                    await submitPendingAnciao(customAnciaoName, userId, userName, saved.id);
                }
                onSaved();
            }
        } catch (err) {
            alert('Erro ao salvar: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    const handleAddAnciao = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = ancipaoInput.trim();

        // Validate: must have at least two words (nome + sobrenome)
        if (name.split(/\s+/).filter(Boolean).length < 2) {
            alert('É obrigatório informar nome e sobrenome (ex: João Augusto).');
            return;
        }

        if (isAdmin) {
            // Admin: save directly to DB so it's available for everyone
            const { error } = await supabase.from('anciaes').insert({ name });
            if (!error) {
                setShowAnciaoModal(false);
                setAnciaoInput('');
                onSaved(undefined); // refresh anciaes list
            }
        } else {
            // Non-admin: use locally only, submit pending request after save
            setCustomAnciaoName(name);
            setStat(prev => ({ ...prev, anciao_id: undefined }));
            setShowAnciaoModal(false);
            setAnciaoInput('');
        }
    };

    const handleAddEnc = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const { error } = await supabase.from('conductors').insert({
            id: crypto.randomUUID(), name: fd.get('name') as string, congregation: fd.get('congregation') as string, type: 'Regional'
        });
        if (!error) { setShowEncModal(false); onSaved(undefined); }
    };

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-lg text-center shadow-sm";
    const selectClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm";
    const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1";

    const renderInstrumentGroup = (familyKey: string) => {
        const family = STAT_INSTRUMENTS[familyKey as keyof typeof STAT_INSTRUMENTS];
        const colors = FAMILY_COLORS[familyKey];
        return (
            <div key={familyKey} className={`${colors.bg} ${colors.border} border rounded-2xl p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{colors.label}</h4>
                    <span className="text-xs font-black text-slate-500 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200">
                        Total: {familyTotals[familyKey as keyof typeof familyTotals]}
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {family.map(inst => (
                        <div key={inst.key} className="space-y-1 min-w-0">
                            <label className="text-[11px] text-slate-500 font-bold truncate block" title={inst.label}>{inst.label}</label>
                            <input
                                type="number" min="0" placeholder="0"
                                value={(stat[inst.key as keyof EventStatistic] as number) || ''}
                                onChange={e => updateField(inst.key, e.target.value ? parseInt(e.target.value) : 0)}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-4xl my-4 sm:my-8 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 bg-indigo-600 flex justify-between items-center sm:p-8">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Cadastrar Dados do Evento</h3>
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Estatísticas Musicais</p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all text-white">
                        <X size={24} className="text-white" />
                    </button>
                </div>

                <div className="p-4 sm:p-8 space-y-8 max-h-[85vh] sm:max-h-[75vh] overflow-y-auto overflow-x-hidden relative">
                    {/* SECTION 1: General Data */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
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
                                <label className={labelClass}>Presidência (Ancião)</label>
                                {customAnciaoName ? (
                                    // Show custom ancião chip
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 shadow-sm">
                                            <UserCheck size={16} className="text-amber-600 flex-shrink-0" />
                                            <span className="font-semibold text-amber-800 text-sm flex-1">IR. {customAnciaoName.toUpperCase()}</span>
                                            {!isAdmin && (
                                                <span className="text-[10px] bg-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">Não cadastrado</span>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => setCustomAnciaoName('')}
                                            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-500" title="Remover e escolher outro">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select value={stat.anciao_id || ''} onChange={e => setStat(p => ({ ...p, anciao_id: parseInt(e.target.value) || undefined }))} className={selectClass + " flex-1"}>
                                            <option value="">Selecione um Ancião...</option>
                                            {anciaes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                        <button type="button" onClick={() => setShowAnciaoModal(true)}
                                            className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-4 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                                            title={isAdmin ? 'Cadastrar Novo Ancião no banco' : 'Adicionar ancião (uso local)'}>
                                            <Plus size={16} /> Novo
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Palavra</label>
                                <input type="text" placeholder="Ex: Salmos 32" value={stat.palavra || ''} onChange={e => setStat(p => ({ ...p, palavra: e.target.value }))} className={inputClass + ' text-left'} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}><Hash size={12} /> Hino de Abertura</label>
                                <input type="number" min="0" placeholder="0" value={stat.hino_abertura || ''} onChange={e => setStat(p => ({ ...p, hino_abertura: e.target.value ? parseInt(e.target.value) : undefined }))} className={inputClass} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className={labelClass}>
                                    <Music size={12} /> Hinos Ensaiados
                                    {hinosEnsaiadosList.length > 0 && (
                                        <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded-full">
                                            {hinosEnsaiadosList.length} {hinosEnsaiadosList.length === 1 ? 'hino' : 'hinos'}
                                        </span>
                                    )}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number" min="1" placeholder="Nº do hino..."
                                        value={hinoInput}
                                        onChange={e => setHinoInput(e.target.value)}
                                        onKeyDown={handleHinoKeyDown}
                                        className={inputClass + ' flex-1'}
                                    />
                                    <button
                                        type="button"
                                        onClick={addHino}
                                        className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-4 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm flex-shrink-0"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {hinosEnsaiadosList.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {hinosEnsaiadosList.map(n => (
                                            <div key={n} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm animate-in fade-in zoom-in-95 duration-150">
                                                <span>{n}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeHino(n)}
                                                    className="text-white/70 hover:text-white transition-colors rounded-full p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {hinosEnsaiadosList.length === 0 && (
                                    <p className="text-[10px] text-slate-400 ml-1">Digite o número e pressione Enter ou toque em +</p>
                                )}
                            </div>
                        </div>
                        {/* Enc. Regionais multi-select */}
                        <div className="space-y-2">
                            <label className={labelClass}>Encarregado(s) Regional(is)</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !selectedEncRegionais.includes(val)) {
                                            setSelectedEncRegionais(prev => [...prev, val]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className={selectClass + " flex-1"}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Selecione para adicionar...</option>
                                    {encRegionais.filter(enc => !selectedEncRegionais.includes(enc.id)).map(enc => (
                                        <option key={enc.id} value={enc.id}>{enc.name} {enc.congregation ? `(${enc.congregation})` : ''}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setShowEncModal(true)} className="flex items-center justify-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-4 py-3 sm:py-0 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm" title="Cadastrar Novo Encarregado">
                                    <Plus size={16} /> Novo
                                </button>
                            </div>

                            {/* Selected Pills */}
                            {selectedEncRegionais.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {selectedEncRegionais.map(id => {
                                        const enc = encRegionais.find(e => e.id === id);
                                        if (!enc) return null;
                                        return (
                                            <div key={id} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <span>{enc.name} {enc.congregation ? `(${enc.congregation})` : ''}</span>
                                                <button type="button" onClick={() => setSelectedEncRegionais(prev => prev.filter(eId => eId !== id))} className="text-indigo-500 hover:text-indigo-900 bg-white/50 hover:bg-white rounded-full p-0.5 transition-colors" title="Remover da lista">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SECTION 2: Orchestral Formation */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Music size={16} /> Formação Orquestral
                        </h3>
                        <div className="space-y-4">
                            {Object.keys(STAT_INSTRUMENTS).map(key => renderInstrumentGroup(key))}
                        </div>

                        {/* Live Calculation Summary */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 shadow-inner">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center">Resumo por Família</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {([
                                    { label: 'Cordas', value: familyTotals.cordas, pct: familyPct.cordas, ideal: 50, color: 'text-yellow-600' },
                                    { label: 'Madeiras', value: familyTotals.madeiras, pct: familyPct.madeiras, ideal: 25, color: 'text-blue-600' },
                                    { label: 'Metais', value: familyTotals.metais, pct: familyPct.metais, ideal: 25, color: 'text-green-600' },
                                    { label: 'Acordeon', value: familyTotals.acordeon, pct: familyPct.acordeon, ideal: null, color: 'text-slate-600' },
                                ] as const).map(fam => (
                                    <div key={fam.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
                                        <p className={`text-3xl font-black ${fam.color}`}>{fam.value}</p>
                                        <p className="text-xs font-bold text-slate-800 mt-1">{fam.label}</p>
                                        <p className="text-[10px] mt-1 font-semibold">
                                            <span className={fam.color}>{fam.pct}%</span>
                                            {fam.ideal !== null && <span className="text-slate-400"> / {fam.ideal}% ideal</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center pt-4 border-t border-slate-200">
                                <p className="text-4xl font-black text-slate-900">{familyTotals.total}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total de Instrumentos</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Ministry */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Users size={16} /> Ministério e Administração
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {MINISTRY_FIELDS.map(field => {
                                if (field.key === 'musicos') {
                                    return (
                                        <div key={field.key} className="space-y-1 min-w-0">
                                            <label className="text-[11px] text-slate-400 font-bold truncate block" title={field.label}>{field.label}</label>
                                            <div className={`${inputClass} bg-slate-100 text-slate-500 cursor-default select-none flex items-center`} title="Calculado automaticamente a partir dos instrumentos">
                                                {familyTotals.total}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={field.key} className="space-y-1 min-w-0">
                                        <label className="text-[11px] text-slate-400 font-bold truncate block" title={field.label}>{field.label}</label>
                                        <input
                                            type="number" min="0" placeholder="0"
                                            value={(stat[field.key as keyof EventStatistic] as number) || ''}
                                            onChange={e => updateField(field.key, e.target.value ? parseInt(e.target.value) : 0)}
                                            className={inputClass}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 grid grid-cols-2 gap-4 text-center shadow-inner">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                <p className="text-3xl font-black text-indigo-600">{ministryTotals.musicosOrganistas}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Músicos + Organistas</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                <p className="text-4xl font-black text-slate-900">{ministryTotals.totalGeral}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Geral</p>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : (editingStat ? 'Salvar Alterações' : 'Salvar Estatística')} <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Add Ancião Modal */}
            {showAnciaoModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100">
                        <h4 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
                            {isAdmin ? 'Cadastrar Ancião' : 'Adicionar Ancião'}
                        </h4>
                        {!isAdmin && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5">
                                <p className="text-xs text-amber-700 font-semibold">
                                    Como você não é administrador, este nome será usado apenas neste cadastro.
                                    Um aviso será enviado ao admin para aprovação no banco de dados.
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleAddAnciao} className="space-y-5 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Nome e Sobrenome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    placeholder="Ex: João Augusto"
                                    value={ancipaoInput}
                                    onChange={e => setAnciaoInput(e.target.value)}
                                    className={inputClass + ' text-left'}
                                />
                                <p className="text-[10px] text-slate-400 ml-1">Obrigatório informar nome e sobrenome.</p>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setShowAnciaoModal(false); setAnciaoInput(''); }}
                                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className={`flex-1 py-3.5 rounded-2xl font-bold transition-colors shadow-lg ${isAdmin ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'}`}>
                                    {isAdmin ? 'Salvar no Banco' : 'Usar neste Cadastro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add Enc. Regional Modal */}
            {showEncModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100">
                        <h4 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Cadastrar Enc. Regional</h4>
                        <form onSubmit={handleAddEnc} className="space-y-5">
                            <input name="name" required placeholder="Nome" className={inputClass + ' text-left'} />
                            <input name="congregation" placeholder="Região / Congregação Principal (Ex: São Paulo/SP)" required className={inputClass + ' text-left'} />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowEncModal(false)} className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
