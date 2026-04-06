import React, { useEffect } from 'react';
import {
  Calendar,
  Landmark,
  Users,
  CheckCircle,
  UserPlus,
  Settings,
  Filter,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  MapPin,
  Clock,
  Briefcase,
  Music,
  User,
  ClipboardList,
  Info,
  List,
  FileText,
} from 'lucide-react';
import { generatePresencePDF } from '../utils/pdfReport';
import type {
  RehearsalEvent,
  Encarregado,
  Congregation,
  Presence,
  UserProfile,
  CongregationCategory,
  MinistryRole,
  EventTypeDefinition,
  ServiceDay,
  Ministry,
} from '../types';
import { MONTHS_PT, INSTRUMENTS, UserRole } from '../types';
import { EVENT_COLORS } from '../constants';
import { getTypeStyles, getFriendlyEventName } from '../utils/eventHelpers';
import ConductorProfileCard from '../components/ConductorProfileCard';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

type AdminSubTab = 'events' | 'conductors' | 'confirmations' | 'congregations' | 'users' | 'settings';

interface AdminPageProps {
  adminSubTab: AdminSubTab;
  setAdminSubTab: (tab: AdminSubTab) => void;
  // Data
  events: RehearsalEvent[];
  conductors: Encarregado[];
  congregations: Congregation[];
  presences: Presence[];
  categories: CongregationCategory[];
  roles: MinistryRole[];
  eventTypeList: EventTypeDefinition[];
  allProfiles: UserProfile[];
  // Filters
  monthFilter: string;
  setMonthFilter: (v: string) => void;
  conductorFilter: string;
  setConductorFilter: (v: string) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  filteredEvents: RehearsalEvent[];
  filteredPresences: Presence[];
  filteredCongregations: Congregation[];
  uniqueConductors: string[];
  uniqueLocations: string[];
  eventTypes: string[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  congregationSearch: string;
  setCongregationSearch: (v: string) => void;
  presenceSearch: string;
  setPresenceSearch: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  // Edit config state
  editingCategory: CongregationCategory | null;
  setEditingCategory: (v: CongregationCategory | null) => void;
  editingRole: MinistryRole | null;
  setEditingRole: (v: MinistryRole | null) => void;
  editingEventType: EventTypeDefinition | null;
  setEditingEventType: (v: EventTypeDefinition | null) => void;
  // Modal triggers
  onNewEvent: () => void;
  onEditEvent: (event: RehearsalEvent) => void;
  onNewConductor: () => void;
  onEditConductor: (conductor: Encarregado) => void;
  onNewCongregation: () => void;
  onEditCongregation: (congregation: Congregation) => void;
  onEditMember: (profile: UserProfile) => void;
  onDeleteMember: (profile: UserProfile) => void;
  // Actions
  onToggleCancelEvent: (event: RehearsalEvent) => void;
  onDeleteEvent: (event: RehearsalEvent) => void;
  onDeleteConductor: (id: string) => void;
  onDeleteCongregation: (id: string) => void;
  onDeletePresence: (id: string) => void;
  onUpdateUserProfile: (id: string, updates: Partial<UserProfile> & { congregation_id?: string | null }) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
  onAddRole: (name: string) => void;
  onDeleteRole: (id: number) => void;
  onAddEventType: (name: string, value: string, color: string, textColor: string) => void;
  onDeleteEventType: (id: number) => void;
}

const NAV_TABS: { key: AdminSubTab; label: string; Icon: React.ElementType }[] = [
  { key: 'events', label: 'EVENTOS', Icon: Calendar },
  { key: 'congregations', label: 'CONGREGAÇÕES', Icon: Landmark },
  { key: 'conductors', label: 'ENCARREGADOS', Icon: Users },
  { key: 'confirmations', label: 'CONFIRMAÇÕES', Icon: CheckCircle },
  { key: 'users', label: 'MEMBROS', Icon: UserPlus },
  { key: 'settings', label: 'CONFIGS', Icon: Settings },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  adminSubTab,
  setAdminSubTab,
  events,
  conductors,
  congregations,
  presences,
  categories,
  roles,
  eventTypeList,
  allProfiles,
  monthFilter,
  setMonthFilter,
  conductorFilter,
  setConductorFilter,
  locationFilter,
  setLocationFilter,
  typeFilter,
  setTypeFilter,
  filteredEvents,
  filteredPresences,
  filteredCongregations,
  uniqueConductors,
  uniqueLocations,
  eventTypes,
  memberSearch,
  setMemberSearch,
  congregationSearch,
  setCongregationSearch,
  presenceSearch,
  setPresenceSearch,
  hasActiveFilters,
  clearFilters,
  editingCategory,
  setEditingCategory,
  editingRole,
  setEditingRole,
  editingEventType,
  setEditingEventType,
  onNewEvent,
  onEditEvent,
  onNewConductor,
  onEditConductor,
  onNewCongregation,
  onEditCongregation,
  onEditMember,
  onDeleteMember,
  onToggleCancelEvent,
  onDeleteEvent,
  onDeleteConductor,
  onDeleteCongregation,
  onDeletePresence,
  onUpdateUserProfile,
  onAddCategory,
  onDeleteCategory,
  onAddRole,
  onDeleteRole,
  onAddEventType,
  onDeleteEventType,
}) => {
  // Silence unused-var warnings for data passed but consumed deeper
  void events; void presences; void conductors; void congregations; void allProfiles;

  const presencesPagination = usePagination(filteredPresences, 15);
  const congregationsPagination = usePagination(filteredCongregations, 15);

  useEffect(() => { presencesPagination.setPage(1); }, [filteredPresences.length]);
  useEffect(() => { congregationsPagination.setPage(1); }, [filteredCongregations.length]);

  const handleExportPresencesPDF = () => {
    generatePresencePDF(
      { day: new Date().toLocaleDateString('pt-BR'), month: '', location: 'Todos os Eventos', time: '', conductor: '', type: '' },
      filteredPresences.map(p => ({ name: p.name, instrument: p.instrument, phone: p.phone || '', email: p.email || '' }))
    );
  };

  return (
    <div className="px-4 mt-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto mb-12">
      <header className="space-y-6">
        <div className="border-l-4 border-indigo-600 pl-4 py-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Painel Administrativo</h1>
          <p className="text-slate-500 font-medium">Gestão centralizada do sistema 2026.</p>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 flex gap-2 snap-x">
          {NAV_TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setAdminSubTab(key)}
              className={`flex-none snap-center px-4 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 border shadow-sm ${
                adminSubTab === key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-300 shadow-md scale-105'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:block relative">
          <div className="bg-white border border-slate-100 p-1.5 rounded-[1.5rem] shadow-sm flex overflow-x-auto no-scrollbar gap-1 w-full">
            {NAV_TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setAdminSubTab(key)}
                className={`flex-none min-w-[120px] px-5 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 ${
                  adminSubTab === key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── TAB: EVENTOS ── */}
      {adminSubTab === 'events' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Cronograma</h3>
            <button
              onClick={onNewEvent}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-black hover:scale-105 transition-all"
            >
              <Plus size={16} /> NOVO EVENTO
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Filter size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Filtrar Base</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} /> Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Mês</label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Todos">Todos</option>
                  {MONTHS_PT.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Local</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {uniqueLocations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Encarregado</label>
                <select
                  value={conductorFilter}
                  onChange={(e) => setConductorFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {uniqueConductors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">Local/Data</th>
                    <th className="px-6 py-5">Categoria</th>
                    <th className="px-6 py-5">Estado</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-bold block text-slate-800 tracking-tight leading-tight">{event.location}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                          {event.day.split(' ')[0]} {event.month} • {event.time}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getTypeStyles(event.type).bg} ${getTypeStyles(event.type).text}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest ${event.canceled ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {event.canceled ? 'OFF' : 'ON'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onToggleCancelEvent(event)}
                            className={`p-2.5 rounded-xl transition-all ${event.canceled ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                          >
                            {event.canceled ? <CheckCircle size={18} /> : <X size={18} />}
                          </button>
                          <button onClick={() => onEditEvent(event)} className="p-2.5 rounded-xl text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => onDeleteEvent(event)} className="p-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-95">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CONGREGAÇÕES ── */}
      {adminSubTab === 'congregations' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Congregações</h3>
            <button
              onClick={onNewCongregation}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-black hover:scale-105 transition-all"
            >
              <Plus size={16} /> NOVA CONGREGAÇÃO
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filtrar por nome ou cidade..."
              value={congregationSearch}
              onChange={(e) => setCongregationSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 shadow-sm rounded-2xl py-2.5 pl-12 pr-4 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {congregationsPagination.paginatedItems.map((cong) => (
              <div key={cong.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                      {cong.category}
                    </span>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{cong.name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEditCongregation(cong)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDeleteCongregation(cong.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Localização
                      </p>
                      <p className="text-sm font-medium text-slate-600">{cong.address}</p>
                      <p className="text-xs text-slate-400 font-bold">{cong.cep} • {cong.city}, {cong.state}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Dias de Culto
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cong.serviceDays.map((sd: ServiceDay, i: number) => (
                          <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200 uppercase">
                            {sd.day.slice(0, 3)} - {sd.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12} /> Ministério
                      </p>
                      <div className="space-y-2 pt-1">
                        {cong.ministry.map((m: Ministry, i: number) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{m.role}</span>
                            <span className="text-sm font-black text-slate-700">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={congregationsPagination.page}
            totalPages={congregationsPagination.totalPages}
            onPageChange={congregationsPagination.setPage}
            totalItems={filteredCongregations.length}
            pageSize={15}
          />
        </div>
      )}

      {/* ── TAB: ENCARREGADOS ── */}
      {adminSubTab === 'conductors' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Perfis</h3>
            <button
              onClick={onNewConductor}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-black hover:scale-105 transition-all"
            >
              <Plus size={16} /> NOVO PERFIL
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {conductors.map((conductor) => (
              <ConductorProfileCard
                key={conductor.id}
                conductor={conductor}
                onEdit={() => onEditConductor(conductor)}
                onDelete={() => onDeleteConductor(conductor.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: CONFIRMAÇÕES ── */}
      {adminSubTab === 'confirmations' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Lista de Confirmados</h3>
              <button onClick={handleExportPresencesPDF} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all">
                <FileText size={14} /> Exportar PDF
              </button>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Busca rápida..."
                value={presenceSearch}
                onChange={(e) => setPresenceSearch(e.target.value)}
                className="w-full bg-white border border-slate-100 shadow-sm rounded-2xl py-2.5 pl-12 pr-4 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">Músico</th>
                    <th className="px-6 py-5">Instrumento</th>
                    <th className="px-6 py-5">Evento</th>
                    <th className="px-6 py-5">Congregação / Local</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {presencesPagination.paginatedItems.length > 0 ? (
                    presencesPagination.paginatedItems.map((presence) => {
                      const event = filteredEvents.find((e) => e.id === presence.eventId) ??
                        { location: 'Não informado', day: '', month: '', type: 'LOCAL' as const };
                      const eventName = 'type' in event ? getFriendlyEventName(event.type) : 'Evento';
                      const eventStyles = 'type' in event ? getTypeStyles(event.type) : { text: 'text-slate-500', bg: 'bg-slate-100' };

                      return (
                        <tr key={presence.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                                <User size={16} />
                              </div>
                              <div>
                                <span className="font-bold block text-slate-800 tracking-tight leading-none truncate max-w-[120px]">{presence.name}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-1 uppercase tracking-tighter italic">
                                  {presence.phone || 'Sem Telefone'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Music size={14} className="text-slate-400" />
                              <span className="font-semibold text-slate-700 text-xs truncate max-w-[80px]">{presence.instrument}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase w-fit ${eventStyles.bg} ${eventStyles.text}`}>
                              {eventName}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-emerald-500" />
                              <div>
                                <span className="font-bold block text-slate-800 tracking-tight text-xs uppercase tracking-tighter leading-none">{event.location}</span>
                                {'day' in event && (
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
                                    {event.day.split(' ')[0]} {event.month}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button onClick={() => onDeletePresence(presence.id)} className="p-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-90">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                        <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
                        Nenhuma confirmação encontrada para os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={presencesPagination.page}
            totalPages={presencesPagination.totalPages}
            onPageChange={presencesPagination.setPage}
            totalItems={filteredPresences.length}
            pageSize={15}
          />
        </div>
      )}

      {/* ── TAB: MEMBROS ── */}
      {adminSubTab === 'users' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Membros</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full bg-white border border-slate-100 shadow-sm rounded-2xl py-2.5 pl-12 pr-4 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">Nome / E-mail</th>
                    <th className="px-6 py-5">Cargo / Tipo</th>
                    <th className="px-6 py-5">Instrumento</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {allProfiles
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        p.email.toLowerCase().includes(memberSearch.toLowerCase())
                    )
                    .map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 text-slate-400 p-2.5 rounded-xl">
                              <User size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 tracking-tight">{profile.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{profile.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <select
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-indigo-600 outline-none cursor-pointer"
                            value={profile.role}
                            onChange={(e) =>
                              onUpdateUserProfile(profile.id, { role: e.target.value as UserRole })
                            }
                          >
                            <option value="USER">Comum</option>
                            <option value="MUSICIAN">Músico</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <select
                            className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none cursor-pointer"
                            value={profile.instrument}
                            onChange={(e) =>
                              onUpdateUserProfile(profile.id, { instrument: e.target.value })
                            }
                          >
                            {INSTRUMENTS.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEditMember(profile)}
                              className="p-2.5 rounded-xl text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all shadow-sm"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteMember(profile)}
                              className="p-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all shadow-sm active:scale-90"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CONFIGURAÇÕES ── */}
      {adminSubTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Configurações Base</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CATEGORIES */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-indigo-600">
                <Filter size={20} />
                <h4 className="font-black uppercase tracking-widest text-xs">Categorias de Congregação</h4>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements.namedItem('catName') as HTMLInputElement).value;
                  onAddCategory(name);
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input
                  key={editingCategory?.id || 'new'}
                  name="catName"
                  required
                  type="text"
                  defaultValue={editingCategory?.name || ''}
                  placeholder="Ex: CENTRAL"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 uppercase">
                  {editingCategory ? 'Salvar' : 'ADD'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={() => setEditingCategory(null)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-colors uppercase">
                    X
                  </button>
                )}
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pt-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingCategory(cat)} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteCategory(cat.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-[10px] text-slate-400 py-6 font-bold flex items-center justify-center gap-2 italic uppercase tracking-widest">
                    <Info size={12} /> Nenhuma categoria cadastrada.
                  </p>
                )}
              </div>
            </div>

            {/* ROLES */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-indigo-600">
                <Briefcase size={20} />
                <h4 className="font-black uppercase tracking-widest text-xs">Cargos do Ministério</h4>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements.namedItem('roleName') as HTMLInputElement).value;
                  onAddRole(name);
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input
                  key={editingRole?.id || 'new'}
                  name="roleName"
                  required
                  type="text"
                  defaultValue={editingRole?.name || ''}
                  placeholder="Ex: Ancião"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 uppercase">
                  {editingRole ? 'Salvar' : 'ADD'}
                </button>
                {editingRole && (
                  <button type="button" onClick={() => setEditingRole(null)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-colors uppercase">
                    X
                  </button>
                )}
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pt-2">
                {roles.map((r) => (
                  <div key={r.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                    <span className="text-sm font-bold text-slate-700">{r.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingRole(r)} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteRole(r.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {roles.length === 0 && (
                  <p className="text-center text-[10px] text-slate-400 py-6 font-bold flex items-center justify-center gap-2 italic uppercase tracking-widest">
                    <Info size={12} /> Nenhum cargo cadastrado.
                  </p>
                )}
              </div>
            </div>

            {/* EVENT TYPES */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 text-indigo-600">
                <List size={20} />
                <h4 className="font-black uppercase tracking-widest text-xs">Tipos de Evento</h4>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const name = fd.get('typeName') as string;
                  const value = fd.get('typeValue') as string;
                  const color = fd.get('typeColor') as string;
                  const textColor = fd.get('typeTextColor') as string;
                  onAddEventType(name, value, color, textColor);
                  if (!editingEventType) e.currentTarget.reset();
                }}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100"
              >
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Nome (Ex: Ensaio Local)</label>
                  <input
                    key={editingEventType?.id || 'new-name'}
                    name="typeName"
                    required
                    type="text"
                    defaultValue={editingEventType?.name || ''}
                    placeholder="Nome Visível"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Valor Interno (Ex: LOCAL)</label>
                  <input
                    key={editingEventType?.id || 'new-val'}
                    name="typeValue"
                    required
                    type="text"
                    defaultValue={editingEventType?.value || ''}
                    placeholder="VALOR_INTERNO"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
                  />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Cor do Evento</label>
                  <div className="relative group">
                    <input type="hidden" name="typeColor" value={editingEventType?.color || '#2563EB'} id="typeColorInput" />
                    <div className="grid grid-cols-7 gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                      {EVENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          title={c.name}
                          onClick={() => {
                            const input = document.getElementById('typeColorInput') as HTMLInputElement;
                            if (input) input.value = c.value;
                            const allBtns = document.querySelectorAll('.color-btn-visual');
                            allBtns.forEach((b) => b.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500'));
                            document.getElementById(`btn-${c.value}`)?.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
                          }}
                          id={`btn-${c.value}`}
                          className={`color-btn-visual w-6 h-6 rounded-full shadow-sm hover:scale-110 transition-transform ${editingEventType?.color === c.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1 flex items-end gap-2">
                  <input type="hidden" name="typeTextColor" value="text-white" />
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 uppercase h-[34px]">
                    {editingEventType ? 'Salvar' : 'ADICIONAR'}
                  </button>
                  {editingEventType && (
                    <button type="button" onClick={() => setEditingEventType(null)} className="w-[34px] h-[34px] bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-300">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pt-2">
                {eventTypeList.map((type) => (
                  <div key={type.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${type.color} ${type.text_color}`}>
                        {type.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">{type.value}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingEventType(type)} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteEventType(type.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-1.5 bg-white rounded-lg shadow-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {eventTypeList.length === 0 && (
                  <p className="text-center text-[10px] text-slate-400 py-6 font-bold flex items-center justify-center gap-2 italic uppercase tracking-widest">
                    <Info size={12} /> Nenhum tipo cadastrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
