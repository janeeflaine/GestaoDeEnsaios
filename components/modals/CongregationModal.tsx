import React from 'react';
import { X, Landmark, Filter, MapPin, Clock, Briefcase, Plus, ChevronRight, CheckCircle } from 'lucide-react';
import type {
  Congregation,
  CongregationCategory,
  MinistryRole,
  UserProfile,
  ServiceDay,
  Ministry,
} from '../../types';
import { WEEK_DAYS } from '../../types';

interface CongregationModalProps {
  congregation: Congregation | null;
  categories: CongregationCategory[];
  roles: MinistryRole[];
  allProfiles: UserProfile[];
  tempServiceDays: ServiceDay[];
  setTempServiceDays: (v: ServiceDay[]) => void;
  tempMinistry: Ministry[];
  setTempMinistry: (v: Ministry[]) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const CongregationModal: React.FC<CongregationModalProps> = ({
  congregation,
  categories,
  roles,
  allProfiles,
  tempServiceDays,
  setTempServiceDays,
  tempMinistry,
  setTempMinistry,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {congregation ? 'Editar Congregação' : 'Nova Congregação'}
            </h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
              Gestão de Sedes e Locais de Culto
            </p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 overflow-y-auto space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Landmark size={14} /> Nome da Congregação
              </label>
              <input
                required
                name="name"
                defaultValue={congregation?.name}
                type="text"
                placeholder="Ex: Santa Terezinha"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Filter size={14} /> Categoria
              </label>
              <select
                name="category"
                defaultValue={congregation?.category || 'LOCAL'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {categories.length === 0 && (
                  <>
                    <option value="CENTRAL">CENTRAL</option>
                    <option value="LOCAL">LOCAL</option>
                    <option value="DISTRITO">DISTRITO</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">
              Localização
            </h4>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Logradouro
                </label>
                <input
                  required
                  name="address"
                  defaultValue={congregation?.address}
                  type="text"
                  placeholder="Rua, Número, Bairro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                  <input
                    name="cep"
                    defaultValue={congregation?.cep}
                    type="text"
                    placeholder="00000-000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Cidade / Estado
                  </label>
                  <div className="flex gap-3">
                    <input
                      required
                      name="city"
                      defaultValue={congregation?.city}
                      type="text"
                      placeholder="Cidade"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                    <input
                      required
                      name="state"
                      defaultValue={congregation?.state || 'MG'}
                      type="text"
                      placeholder="UF"
                      className="w-20 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2 flex justify-between items-center">
              <span className="flex items-center gap-2"><Clock size={12} /> Dias de Culto</span>
              <button
                type="button"
                onClick={() => setTempServiceDays([...tempServiceDays, { day: '', time: '19:30' }])}
                className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors"
              >
                <Plus size={12} /> ADICIONAR DIA
              </button>
            </h4>
            <div className="space-y-3">
              {tempServiceDays.map((sd, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <select
                    value={sd.day}
                    onChange={(e) => {
                      const newDays = [...tempServiceDays];
                      newDays[idx] = { ...newDays[idx], day: e.target.value };
                      setTempServiceDays(newDays);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="">Selecione o Dia...</option>
                    {WEEK_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    value={sd.time}
                    onChange={(e) => {
                      const newDays = [...tempServiceDays];
                      newDays[idx] = { ...newDays[idx], time: e.target.value };
                      setTempServiceDays(newDays);
                    }}
                    type="text"
                    placeholder="19:30"
                    className="w-32 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setTempServiceDays(tempServiceDays.filter((_, i) => i !== idx))}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              {tempServiceDays.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 italic">
                  Nenhum dia de culto adicionado.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2 flex justify-between items-center">
              <span className="flex items-center gap-2"><Briefcase size={12} /> Ministério</span>
              <button
                type="button"
                onClick={() => setTempMinistry([...tempMinistry, { role: '', name: '' }])}
                className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors"
              >
                <Plus size={12} /> ADICIONAR MEMBRO
              </button>
            </h4>
            <div className="space-y-3">
              {tempMinistry.map((m, idx) => (
                <div key={idx} className="space-y-2 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <select
                        value={m.role}
                        onChange={(e) => {
                          const newMin = [...tempMinistry];
                          newMin[idx] = { ...newMin[idx], role: e.target.value };
                          setTempMinistry(newMin);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      >
                        <option value="">Cargo...</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                        {roles.length === 0 && (
                          <>
                            <option value="Ancião">Ancião</option>
                            <option value="Diácono">Diácono</option>
                            <option value="Cooperador">Cooperador</option>
                          </>
                        )}
                      </select>
                      <div className="relative">
                        <input
                          value={m.name}
                          onChange={(e) => {
                            const newMin = [...tempMinistry];
                            newMin[idx] = { ...newMin[idx], name: e.target.value, profileId: undefined };
                            setTempMinistry(newMin);
                          }}
                          type="text"
                          placeholder="Nome ou busque no sistema..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                        />
                        {m.name.length > 2 && !m.profileId && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto no-scrollbar">
                            {allProfiles
                              .filter((p) => p.name.toLowerCase().includes(m.name.toLowerCase()))
                              .map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    const newMin = [...tempMinistry];
                                    newMin[idx] = { ...newMin[idx], name: p.name, profileId: p.id };
                                    setTempMinistry(newMin);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 border-b border-slate-50 last:border-0 transition-colors"
                                >
                                  <span className="font-bold">{p.name}</span>
                                  <span className="text-[10px] text-slate-400 ml-2 italic">
                                    ({p.instrument})
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                        {m.profileId && (
                          <div className="absolute right-2 top-1.5 bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-1">
                            <CheckCircle size={10} /> VINCULADO
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempMinistry(tempMinistry.filter((_, i) => i !== idx))}
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100 mt-0.5"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {tempMinistry.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 italic">
                  Nenhum membro do ministério adicionado.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex-shrink-0">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700"
            >
              {congregation ? 'Atualizar Congregação' : 'Cadastrar Congregação'}{' '}
              <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
