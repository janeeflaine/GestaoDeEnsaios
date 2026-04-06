import React from 'react';
import { Music, Search, Sparkles, Calendar, CalendarPlus, Droplets, Users, ChevronRight } from 'lucide-react';
import type { RehearsalEvent, EventTypeDefinition } from '../types';
import DashboardStatCard from '../components/DashboardStatCard';
import LargeEventCard from '../components/LargeEventCard';
import EventSummaryCard from '../components/EventSummaryCard';
import { LargeEventCardSkeleton, SmallEventCardSkeleton, StatCardSkeleton } from '../components/SkeletonCard';

interface DashboardStats {
  total: { total: number; remaining: number };
  rehearsals: { total: number; remaining: number };
  baptisms: { total: number; remaining: number };
  youth: { total: number; remaining: number };
  gifts: { total: number; remaining: number };
  presences: number;
}

interface DashboardData {
  largeEvents: RehearsalEvent[];
  smallEvents: RehearsalEvent[];
}

interface DashboardPageProps {
  dashboardData: DashboardData;
  stats: DashboardStats;
  isLoading?: boolean;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  eventTypeList: EventTypeDefinition[];
  setActiveTab: (tab: string) => void;
  onConfirmEvent: (event: RehearsalEvent) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  dashboardData,
  stats,
  isLoading,
  globalSearch,
  setGlobalSearch,
  eventTypeList,
  setActiveTab,
  onConfirmEvent,
}) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-indigo-600 pt-16 pb-40 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full border-[20px] border-white"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border-[30px] border-white"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-2">
            <Music size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Calendário de Eventos CCB - {new Date().getFullYear()}
          </h1>
          <p className="text-indigo-100 font-medium text-sm md:text-base max-w-md mx-auto">
            Confirme sua presença e adicione os ensaio ao seu Google Agenda com apenas um clique.
          </p>

          <div className="mt-10 max-w-2xl mx-auto relative group">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={24}
            />
            <input
              type="text"
              placeholder="Buscar por local ou encarregado..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 shadow-2xl rounded-full py-6 pl-16 pr-8 text-slate-800 outline-none focus:ring-8 focus:ring-white/10 focus:border-indigo-500/20 transition-all font-semibold placeholder:text-slate-300 text-lg md:text-xl"
            />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <DashboardStatCard
                  title="Total Geral de Eventos"
                  total={stats.total.total}
                  remaining={stats.total.remaining}
                  icon={<CalendarPlus size={20} />}
                  iconBg="bg-slate-800"
                />
                <DashboardStatCard
                  title="Ensaios (Local/Reg)"
                  total={stats.rehearsals.total}
                  remaining={stats.rehearsals.remaining}
                  icon={<Calendar size={20} />}
                  iconBg="bg-indigo-500"
                />
              </>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <DashboardStatCard
                  title="Cultos de Batismo"
                  total={stats.baptisms.total}
                  remaining={stats.baptisms.remaining}
                  icon={<Droplets size={20} />}
                  iconBg="bg-sky-500"
                  variant="card"
                />
                <DashboardStatCard
                  title="Reuniões Mocidade"
                  total={stats.youth.total}
                  remaining={stats.youth.remaining}
                  icon={<Users size={20} />}
                  iconBg="bg-rose-500"
                  variant="card"
                />
                <DashboardStatCard
                  title="Busca de Dons"
                  total={stats.gifts.total}
                  remaining={stats.gifts.remaining}
                  icon={<Sparkles size={20} />}
                  iconBg="bg-purple-500"
                  variant="card"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-12 space-y-12 max-w-5xl mx-auto pb-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> Próximos Eventos em Destaque
            </h3>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-all flex items-center gap-1 group"
            >
              Ver Todos{' '}
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <><LargeEventCardSkeleton /><LargeEventCardSkeleton /><LargeEventCardSkeleton /><LargeEventCardSkeleton /></>
            ) : dashboardData.largeEvents.length > 0 ? (
              dashboardData.largeEvents.map((event) => (
                <LargeEventCard
                  key={event.id}
                  event={event}
                  onConfirm={() => onConfirmEvent(event)}
                  allTypes={eventTypeList}
                />
              ))
            ) : (
              <p className="text-slate-400 text-sm italic col-span-full text-center py-8 bg-white rounded-3xl border border-dashed border-slate-200">
                Nenhum evento encontrado para os critérios de busca.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" /> Seguintes na Agenda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <><SmallEventCardSkeleton /><SmallEventCardSkeleton /><SmallEventCardSkeleton /><SmallEventCardSkeleton /></>
            ) : dashboardData.smallEvents.length > 0 ? (
              dashboardData.smallEvents.map((event) => (
                <EventSummaryCard
                  key={event.id}
                  event={event}
                  onClick={() => onConfirmEvent(event)}
                  allTypes={eventTypeList}
                />
              ))
            ) : (
              dashboardData.largeEvents.length > 0 && (
                <p className="text-slate-400 text-sm italic col-span-full opacity-60 text-center py-4">
                  Aguardando novos agendamentos...
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
