import React, { useEffect } from 'react';
import {
  Filter,
  RotateCcw,
  CheckCircle,
  CalendarPlus,
  Layout,
  User,
  FileText,
} from 'lucide-react';
import type { RehearsalEvent, EventTypeDefinition } from '../types';
import { MONTHS_PT } from '../types';
import { generateSchedulePDF } from '../utils/pdfReport';
import { getTypeStyles } from '../utils/eventHelpers';
import { getGoogleCalendarUrl } from '../utils/calendar';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

interface EventsPageProps {
  filteredEvents: RehearsalEvent[];
  eventTypeList: EventTypeDefinition[];
  monthFilter: string;
  setMonthFilter: (v: string) => void;
  conductorFilter: string;
  setConductorFilter: (v: string) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  uniqueConductors: string[];
  uniqueLocations: string[];
  eventTypes: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  today: Date;
  onConfirmEvent: (event: RehearsalEvent) => void;
  congregationName?: string;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  filteredEvents,
  eventTypeList,
  monthFilter,
  setMonthFilter,
  conductorFilter,
  setConductorFilter,
  locationFilter,
  setLocationFilter,
  typeFilter,
  setTypeFilter,
  uniqueConductors,
  uniqueLocations,
  eventTypes,
  hasActiveFilters,
  clearFilters,
  today,
  onConfirmEvent,
  congregationName,
}) => {
  const { page, totalPages, paginatedItems, setPage } = usePagination(filteredEvents, 12);

  useEffect(() => { setPage(1); }, [filteredEvents.length, setPage]);

  const handleExportSchedule = () => {
    generateSchedulePDF(filteredEvents, new Date().getFullYear(), congregationName);
  };

  return (
    <div className="px-4 mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Cronograma {new Date().getFullYear()}
            </h1>
            <p className="text-slate-500 font-medium">
              Explore e filtre todos os eventos planejados para o ano.
            </p>
          </div>
          <button onClick={handleExportSchedule} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm flex-shrink-0">
            <FileText size={14} /> Cronograma PDF
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Filtros Avançados</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={14} /> Redefinir
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                Mês
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Todos">Todos</option>
                {MONTHS_PT.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                Local
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {uniqueLocations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                Encarregado
              </label>
              <select
                value={conductorFilter}
                onChange={(e) => setConductorFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {uniqueConductors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedItems.map((event) => {
          const styles = getTypeStyles(event.type, eventTypeList);
          const isPast = event.fullDate < today;
          return (
            <div
              key={event.id}
              className={`bg-white border ${
                event.canceled || isPast ? 'opacity-50 grayscale-[0.5]' : 'border-slate-100'
              } p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${styles.bg} ${styles.text}`}
                  style={styles.isHex ? { backgroundColor: `${styles.hex}20`, color: styles.hex } : {}}
                >
                  {event.type}
                </span>
                <span className="text-slate-400 text-sm font-bold">
                  {event.day} {event.month}
                </span>
              </div>

              <h3
                className={`text-xl font-black tracking-tight ${
                  event.canceled ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {event.location}
              </h3>
              <div className="mt-3 space-y-2 text-slate-500 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Layout
                    size={16}
                    className={styles.text}
                    style={styles.isHex ? { color: styles.hex } : {}}
                  />{' '}
                  {event.time}
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <User
                    size={16}
                    className={styles.text}
                    style={styles.isHex ? { color: styles.hex } : {}}
                  />{' '}
                  {event.conductor}
                </p>
              </div>

              {!event.canceled && !isPast && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => onConfirmEvent(event)}
                    className={`text-white text-xs font-black px-6 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all shadow-lg ${styles.card}`}
                    style={styles.isHex ? { backgroundColor: styles.hex } : {}}
                  >
                    <CheckCircle size={14} /> Confirmar Presença
                  </button>
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 text-slate-700 text-xs font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <CalendarPlus size={14} /> Agendar
                  </a>
                </div>
              )}
              {event.canceled && (
                <p className="mt-4 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-lg w-fit">
                  Cancelado
                </p>
              )}
              {isPast && !event.canceled && (
                <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg w-fit">
                  Encerrado
                </p>
              )}
            </div>
          );
        })}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredEvents.length}
        pageSize={12}
      />
    </div>
  );
};
