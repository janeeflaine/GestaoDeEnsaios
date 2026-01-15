import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layout, Calendar, CheckCircle, List, Settings, Plus, X, CalendarPlus, ChevronRight, User, Phone, Mail, Music, Filter, RotateCcw, Edit2, Sparkles, Users, Droplets, Clock, MapPin, Search, Trash2, Camera, Map, ClipboardList, LogOut, Landmark, Briefcase, Home, Info, Upload, UserPlus } from 'lucide-react';
import { RehearsalEvent, EventType, Presence, MONTHS_PT, INSTRUMENTS, Encarregado, ConductorType, UserProfile, Congregation, ServiceDay, Ministry, WEEK_DAYS } from './types';
import { INITIAL_EVENTS, INITIAL_CONDUCTORS, INITIAL_CONGREGATIONS } from './constants';
import { getGoogleCalendarUrl } from './utils/calendar';
import { supabase } from './supabaseClient';
import ImageCropperModal from './components/ImageCropper';
import Auth from './components/Auth';

// --- Utility: Type Colors ---
const getTypeStyles = (type: EventType) => {
  switch (type) {
    case EventType.REGIONAL: return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', card: 'bg-amber-500' };
    case EventType.BATISMO: return { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500', card: 'bg-sky-500' };
    case EventType.BUSCA_DONS: return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', card: 'bg-purple-500' };
    case EventType.REUNIAO_MOCIDADE: return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', card: 'bg-rose-500' };
    default: return { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', card: 'bg-indigo-600' };
  }
};

const getFriendlyEventName = (type: EventType) => {
  if (type === EventType.LOCAL) return 'Ensaio Local';
  if (type === EventType.REGIONAL) return 'Ensaio Regional';
  return type;
};

// --- Sub-components ---

const DashboardStatCard: React.FC<{
  title: string;
  total: number;
  remaining: number;
  icon: React.ReactNode;
  iconBg: string;
  variant?: 'row' | 'card'
}> = ({ title, total, remaining, icon, iconBg, variant = 'row' }) => {
  if (variant === 'card') {
    return (
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-2xl hover:-translate-y-1 group">
        <div className="flex items-center gap-4">
          <div className={`${iconBg} p-4 rounded-[1.25rem] text-white shadow-lg flex-shrink-0 flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight flex-1">{title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{remaining}</span>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-2 font-bold">Restantes</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-6">
            <span className="text-4xl font-black text-slate-200 tracking-tighter leading-none group-hover:text-slate-300 transition-colors uppercase">{total}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2 font-bold whitespace-nowrap">Total Anual</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 md:p-6 rounded-[2.5rem] md:rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 md:gap-0 transition-all hover:shadow-2xl hover:-translate-y-1 group">
      <div className="flex items-center gap-4 md:flex-1 pr-6 flex-shrink-1">
        <div className={`${iconBg} p-4 md:p-3.5 rounded-2xl md:rounded-2xl text-white shadow-lg flex-shrink-0 flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight flex-1">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 flex-shrink-0 md:flex md:items-center">
        <div className="flex flex-col md:items-center md:px-8 border-r md:border-none border-slate-100 min-w-[75px] md:min-w-[110px]">
          <span className="text-4xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{remaining}</span>
          <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-2 md:mt-1.5 font-bold">Restantes</span>
        </div>
        <div className="flex flex-col md:items-center pl-4 md:px-8 min-w-[75px] md:min-w-[110px]">
          <span className="text-4xl md:text-3xl font-black text-slate-200 tracking-tighter leading-none group-hover:text-slate-300 transition-colors uppercase">{total}</span>
          <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2 md:mt-1.5 whitespace-nowrap font-bold">Total Anual</span>
        </div>
      </div>
    </div>
  );
};

const LargeEventCard: React.FC<{ event: RehearsalEvent; onConfirm: () => void }> = ({ event, onConfirm }) => {
  const styles = getTypeStyles(event.type);
  const eventName = getFriendlyEventName(event.type);

  return (
    <section className={`rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl transition-all duration-500 ${styles.card}`}>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Calendar size={16} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider">{eventName}</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl w-fit text-center min-w-[90px] shadow-lg">
            <span className="block text-3xl font-black tracking-tighter">{event.day.split(' ')[0]}</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">{event.month}</span>
          </div>
          <div className="space-y-1">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none">Local do Evento</p>
            <h3 className="text-2xl font-black tracking-tight leading-tight">{event.location}</h3>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">{event.time}</span>
              <span className="flex items-center gap-1 text-[10px] opacity-80"><User size={12} /> {event.conductor}</span>
            </div>
          </div>
          <button
            onClick={onConfirm}
            className="mt-2 sm:mt-0 sm:ml-auto bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Confirmar <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-[60px]"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-[60px]"></div>
    </section>
  );
};

const EventSummaryCard: React.FC<{ event: RehearsalEvent; onClick: () => void }> = ({ event, onClick }) => {
  const styles = getTypeStyles(event.type);
  const Icon = event.type === EventType.BATISMO ? Droplets :
    event.type === EventType.BUSCA_DONS ? Sparkles :
      event.type === EventType.REUNIAO_MOCIDADE ? Users : Calendar;

  return (
    <div onClick={onClick} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-all active:scale-95 group">
      <div className={`${styles.bg} ${styles.text} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>{event.type}</p>
        <h4 className="font-bold text-slate-800 truncate leading-tight">{event.location}</h4>
        <p className="text-xs text-slate-500">{event.day.split(' ')[0]} {event.month} • {event.time}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
  );
};

const ConductorProfileCard: React.FC<{ conductor: Encarregado; onEdit: () => void; onDelete: () => void }> = ({ conductor, onEdit, onDelete }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start gap-4">
      <div className="relative">
        <img
          src={conductor.photoUrl || 'https://via.placeholder.com/100'}
          alt={conductor.name}
          className="w-16 h-16 rounded-2xl object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all"
        />
        <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white ${conductor.type === ConductorType.REGIONAL ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          {conductor.type}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 leading-tight">{conductor.name}</h4>
        <p className="text-xs text-slate-400 font-medium mb-2">{conductor.instrument}</p>

        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium uppercase tracking-tight">
            <MapPin size={10} className="text-indigo-400" /> {conductor.congregation}
          </p>
          <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium uppercase tracking-tight">
            <User size={10} className="text-indigo-400" /> {conductor.age} Anos
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          <Edit2 size={16} />
        </button>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

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
      <p className="text-[9px] text-slate-300 font-medium">Desenvolvido para fins de organização interna. © 2026</p>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<'events' | 'conductors' | 'confirmations' | 'congregations'>('events');
  const [events, setEvents] = useState<RehearsalEvent[]>([]);
  const [conductors, setConductors] = useState<Encarregado[]>([]);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth States
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<RehearsalEvent | null>(null);
  const [selectedConductor, setSelectedConductor] = useState<Encarregado | null>(null);
  const [selectedCongregation, setSelectedCongregation] = useState<Congregation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingConductor, setIsCreatingConductor] = useState(false);
  const [isCreatingCongregation, setIsCreatingCongregation] = useState(false);

  const [creatingEventType, setCreatingEventType] = useState<EventType>(EventType.LOCAL);

  // Photo Upload State
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [globalSearch, setGlobalSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('Todos');
  const [conductorFilter, setConductorFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [presenceSearch, setPresenceSearch] = useState('');
  const [congregationSearch, setCongregationSearch] = useState('');

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserProfile({
        ...data,
        photoUrl: data.photo_url // Map snake_case from DB to camelCase in app
      });
    }
  };

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch Events
      const { data: eventsData, error: eError } = await supabase.from('events').select('*');
      if (eError) console.error('Supabase: Erro ao buscar eventos:', eError);
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          ...e,
          fullDate: new Date(e.full_date)
        })));
      }

      // Fetch Conductors
      const { data: condData, error: cError } = await supabase.from('conductors').select('*');
      if (cError) console.error('Supabase: Erro ao buscar encarregados:', cError);
      if (condData) {
        setConductors(condData.map(c => ({
          ...c,
          photoUrl: c.photo_url
        })));
      }

      // Fetch Congregations
      const { data: congData, error: cgError } = await supabase.from('congregations').select('*, service_days(*), ministry(*)');
      if (cgError) console.error('Supabase: Erro ao buscar congregações:', cgError);
      if (congData) {
        setCongregations(congData.map(c => ({
          ...c,
          serviceDays: c.service_days || [],
          ministry: c.ministry || []
        })));
      }

      // Fetch Presences
      const { data: presData, error: pError } = await supabase.from('presences').select('*');
      if (pError) console.error('Supabase: Erro ao buscar presenças:', pError);
      if (presData) {
        setPresences(presData.map(p => ({
          ...p,
          eventId: p.event_id,
          timestamp: new Date(p.timestamp)
        })));
      }
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Current Date
  const today = new Date();

  const congregationList = useMemo(() => congregations.map(c => c.name).sort(), [congregations]);

  const dashboardData = useMemo(() => {
    let futureEvents = events.filter(e => e.fullDate >= today && !e.canceled).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    if (globalSearch) {
      futureEvents = futureEvents.filter(e =>
        e.location.toLowerCase().includes(globalSearch.toLowerCase()) ||
        e.conductor.toLowerCase().includes(globalSearch.toLowerCase())
      );
    }

    return {
      largeEvents: futureEvents.slice(0, 4),
      smallEvents: futureEvents.slice(4, 8)
    };
  }, [events, today, globalSearch]);

  const stats = useMemo(() => {
    const activeEvents = events.filter(e => !e.canceled);

    const countStats = (types: EventType[]) => {
      const filtered = activeEvents.filter(e => types.includes(e.type));
      return {
        total: filtered.length,
        remaining: filtered.filter(e => e.fullDate >= today).length
      };
    };

    return {
      total: countStats(Object.values(EventType)),
      rehearsals: countStats([EventType.LOCAL, EventType.REGIONAL]),
      baptisms: countStats([EventType.BATISMO]),
      youth: countStats([EventType.REUNIAO_MOCIDADE]),
      gifts: countStats([EventType.BUSCA_DONS]),
      presences: presences.length
    };
  }, [events, today, presences]);

  const uniqueConductors = useMemo(() => ['Todos', ...new Array(...new Set(events.map(e => e.conductor)))].sort(), [events]);
  const uniqueLocations = useMemo(() => ['Todos', ...new Array(...new Set(events.map(e => e.location)))].sort(), [events]);
  const eventTypes = useMemo(() => ['Todos', ...Object.values(EventType)], []);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (monthFilter !== 'Todos') list = list.filter(e => e.month === monthFilter);
    if (conductorFilter !== 'Todos') list = list.filter(e => e.conductor === conductorFilter);
    if (locationFilter !== 'Todos') list = list.filter(e => e.location === locationFilter);
    if (typeFilter !== 'Todos') list = list.filter(e => e.type === typeFilter);

    return list.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [events, monthFilter, conductorFilter, locationFilter, typeFilter]);

  const filteredPresences = useMemo(() => {
    let list = presences;
    if (presenceSearch) {
      const search = presenceSearch.toLowerCase();
      list = list.filter(p => {
        const event = events.find(e => e.id === p.eventId);
        return p.name.toLowerCase().includes(search) ||
          p.instrument.toLowerCase().includes(search) ||
          (event?.location.toLowerCase().includes(search)) ||
          (getFriendlyEventName(event?.type || EventType.LOCAL).toLowerCase().includes(search));
      });
    }
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [presences, events, presenceSearch]);

  const filteredCongregations = useMemo(() => {
    let list = congregations;
    if (congregationSearch) {
      const search = congregationSearch.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search)
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [congregations, congregationSearch]);

  const hasActiveFilters = monthFilter !== 'Todos' || conductorFilter !== 'Todos' || locationFilter !== 'Todos' || typeFilter !== 'Todos';

  const clearFilters = () => {
    setMonthFilter('Todos');
    setConductorFilter('Todos');
    setLocationFilter('Todos');
    setTypeFilter('Todos');
  };

  const handleConfirmPresence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPresence = {
      id: Math.random().toString(36).substr(2, 9),
      event_id: selectedEvent?.id || '',
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || '',
      phone: formData.get('phone') as string,
      instrument: formData.get('instrument') as string,
    };

    const { error } = await supabase.from('presences').insert(newPresence);
    if (!error) {
      await fetchInitialData();
      setIsConfirming(false);
      setSelectedEvent(null);
      alert('Presença confirmada com sucesso!');
    } else {
      alert('Erro ao confirmar presença: ' + error.message);
    }
  };

  const handleAddOrUpdateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const month = formData.get('month') as string;
    const dayValue = formData.get('day') as string;
    const weekday = formData.get('weekday') as string;
    const type = formData.get('type') as EventType;
    const monthIndex = MONTHS_PT.indexOf(month);

    const needsConductor = ![EventType.BATISMO, EventType.BUSCA_DONS, EventType.REUNIAO_MOCIDADE].includes(type);

    const eventData = {
      id: selectedEvent ? selectedEvent.id : `event-${Date.now()}`,
      month,
      day: `${dayValue.padStart(2, '0')} (${weekday})`,
      full_date: new Date(2026, monthIndex, parseInt(dayValue)).toISOString(),
      location: formData.get('location') as string,
      time: formData.get('time') as string,
      conductor: needsConductor ? (formData.get('conductor') as string) : 'Coletivo',
      type: type,
    };

    const { error } = await supabase.from('events').upsert(eventData);
    if (!error) {
      await fetchInitialData();
      setIsCreatingEvent(false);
      setSelectedEvent(null);
      alert(selectedEvent ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
    } else {
      alert('Erro ao salvar evento: ' + error.message);
    }
  };

  const handleAddOrUpdateConductor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const conductorData = {
      id: selectedConductor?.id || `cond-${Date.now()}`,
      name: formData.get('name') as string,
      age: parseInt(formData.get('age') as string),
      instrument: formData.get('instrument') as string,
      congregation: formData.get('congregation') as string,
      type: formData.get('type') as ConductorType,
      photo_url: (formData.get('photoUrl') as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name') as string)}&background=random`,
    };

    const { error } = await supabase.from('conductors').upsert(conductorData);
    if (!error) {
      await fetchInitialData();
      setIsCreatingConductor(false);
      setSelectedConductor(null);
      alert(selectedConductor ? 'Perfil atualizado!' : 'Encarregado cadastrado!');
    } else {
      alert('Erro ao salvar encarregado: ' + error.message);
    }
  };

  const handleAddOrUpdateCongregation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const congregationId = selectedCongregation?.id || `cong-${Date.now()}`;
    const congregationData = {
      id: congregationId,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      address: formData.get('address') as string,
      cep: formData.get('cep') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
    };

    const { error: congError } = await supabase.from('congregations').upsert(congregationData);
    if (congError) {
      alert('Erro ao salvar congregação: ' + congError.message);
      return;
    }

    // Update Service Days (Relational or simplify with JSONB if too complex, but let's stick to relational)
    // For simplicity in this demo, let's delete existing and insert new if editing
    if (selectedCongregation) {
      await supabase.from('service_days').delete().eq('congregation_id', congregationId);
      await supabase.from('ministry').delete().eq('congregation_id', congregationId);
    }

    const dayInputs = formData.getAll('serviceDay') as string[];
    const timeInputs = formData.getAll('serviceTime') as string[];
    for (let i = 0; i < dayInputs.length; i++) {
      if (dayInputs[i] && timeInputs[i]) {
        await supabase.from('service_days').insert({
          congregation_id: congregationId,
          day: dayInputs[i],
          time: timeInputs[i]
        });
      }
    }

    const roleInputs = formData.getAll('ministryRole') as string[];
    const nameInputs = formData.getAll('ministryName') as string[];
    for (let i = 0; i < roleInputs.length; i++) {
      if (roleInputs[i] && nameInputs[i]) {
        await supabase.from('ministry').insert({
          congregation_id: congregationId,
          role: roleInputs[i],
          name: nameInputs[i]
        });
      }
    }

    await fetchInitialData();
    setIsCreatingCongregation(false);
    setSelectedCongregation(null);
    alert(selectedCongregation ? 'Congregação atualizada!' : 'Congregação cadastrada!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setUserProfile(prev => prev ? { ...prev, photoUrl: croppedImage } : {
      name: '',
      email: '',
      phone: '',
      instrument: 'Violino',
      photoUrl: croppedImage
    });
    setIsCropping(false);
    setImageToCrop(null);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGuest || !userProfile) {
      alert('Faça login para salvar seu perfil permanentemente.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const profileToSave = {
      id: userProfile.id,
      email: userProfile.email,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      instrument: formData.get('instrument') as string,
      congregation: formData.get('congregation') as string,
      photo_url: userProfile.photoUrl,
      role: userProfile.role
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileToSave);

    if (error) alert('Erro ao salvar: ' + error.message);
    else {
      setUserProfile({
        ...userProfile,
        name: profileToSave.name,
        phone: profileToSave.phone,
        instrument: profileToSave.instrument,
        congregation: profileToSave.congregation
      });
      alert('Perfil atualizado com sucesso!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    setActiveTab('dashboard');
  };

  const deleteConductor = async (id: string) => {
    if (confirm('Deseja realmente excluir este perfil?')) {
      const { error } = await supabase.from('conductors').delete().eq('id', id);
      if (!error) await fetchInitialData();
      else alert('Erro ao excluir: ' + error.message);
    }
  };

  const deleteCongregation = async (id: string) => {
    if (confirm('Deseja realmente excluir esta congregação?')) {
      const { error } = await supabase.from('congregations').delete().eq('id', id);
      if (!error) await fetchInitialData();
      else alert('Erro ao excluir: ' + error.message);
    }
  };

  const deletePresence = async (id: string) => {
    if (confirm('Deseja realmente remover esta confirmação?')) {
      const { error } = await supabase.from('presences').delete().eq('id', id);
      if (!error) await fetchInitialData();
      else alert('Erro ao excluir: ' + error.message);
    }
  };

  const toggleCancelEvent = async (event: RehearsalEvent) => {
    const { error } = await supabase.from('events').update({ canceled: !event.canceled }).eq('id', event.id);
    if (!error) await fetchInitialData();
    else alert('Erro ao alterar status: ' + error.message);
  };

  const isConductorDisabled = [EventType.BATISMO, EventType.BUSCA_DONS, EventType.REUNIAO_MOCIDADE].includes(creatingEventType);

  if (!session && !isGuest) {
    return <Auth onGuestAccess={() => setIsGuest(true)} />;
  }

  return (
    <div className="pb-24 flex flex-col min-h-screen selection:bg-indigo-100 selection:text-indigo-900 bg-slate-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={userProfile} />

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando dados...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto w-full flex-grow">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
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
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Calendário de Ensaios 2026</h1>
                  <p className="text-indigo-100 font-medium text-sm md:text-base max-w-md mx-auto">
                    Confirme sua presença e adicione os ensaios ao seu Google Calendar com apenas um clique.
                  </p>

                  <div className="mt-10 max-w-2xl mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
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
                  {/* Row 1: 2 Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                  {/* Row 2: 3 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardStatCard
                      title="Batismos Efetuados"
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
                  </div>
                </div>
              </div>

              <div className="px-4 mt-12 space-y-12 max-w-5xl mx-auto pb-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" /> Próximos Ensaios em Destaque
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardData.largeEvents.length > 0 ? (
                      dashboardData.largeEvents.map(event => (
                        <LargeEventCard
                          key={event.id}
                          event={event}
                          onConfirm={() => { setSelectedEvent(event); setIsConfirming(true); }}
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
                    {dashboardData.smallEvents.length > 0 ? (
                      dashboardData.smallEvents.map(event => (
                        <EventSummaryCard
                          key={event.id}
                          event={event}
                          onClick={() => { setSelectedEvent(event); setIsConfirming(true); }}
                        />
                      ))
                    ) : (
                      dashboardData.largeEvents.length > 0 && (
                        <p className="text-slate-400 text-sm italic col-span-full opacity-60 text-center py-4">Aguardando novos agendamentos...</p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="px-4 mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <header className="space-y-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cronograma 2026</h1>
                  <p className="text-slate-500 font-medium">Explore e filtre todos os eventos planejados para o ano.</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <Filter size={18} />
                    <span className="text-sm font-bold uppercase tracking-widest">Filtros Avançados</span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="ml-auto text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <RotateCcw size={14} /> Redefinir
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Mês</label>
                      <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option value="Todos">Todos</option>
                        {MONTHS_PT.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Local</label>
                      <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Encarregado</label>
                      <select value={conductorFilter} onChange={(e) => setConductorFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        {uniqueConductors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tipo</label>
                      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                {filteredEvents.map((event) => {
                  const styles = getTypeStyles(event.type);
                  const isPast = event.fullDate < today;
                  return (
                    <div key={event.id} className={`bg-white border ${event.canceled || isPast ? 'opacity-50 grayscale-[0.5]' : 'border-slate-100'} p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${styles.bg} ${styles.text}`}>
                          {event.type}
                        </span>
                        <span className="text-slate-400 text-sm font-bold">{event.day} {event.month}</span>
                      </div>

                      <h3 className={`text-xl font-black tracking-tight ${event.canceled ? 'line-through text-slate-400' : 'text-slate-800'}`}>{event.location}</h3>
                      <div className="mt-3 space-y-2 text-slate-500 text-sm">
                        <p className="flex items-center gap-2 font-medium"><Layout size={16} className={styles.text} /> {event.time}</p>
                        <p className="flex items-center gap-2 font-medium"><User size={16} className={styles.text} /> {event.conductor}</p>
                      </div>

                      {!event.canceled && !isPast && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          <button onClick={() => { setSelectedEvent(event); setIsConfirming(true); }} className={`text-white text-xs font-black px-6 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all shadow-lg ${styles.card}`}>
                            <CheckCircle size={14} /> Confirmar Presença
                          </button>
                          <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-700 text-xs font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-colors">
                            <CalendarPlus size={14} /> Agendar
                          </a>
                        </div>
                      )}
                      {event.canceled && <p className="mt-4 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-lg w-fit">Cancelado</p>}
                      {isPast && !event.canceled && <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg w-fit">Encerrado</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="px-4 mt-8 space-y-8 animate-in slide-in-from-top-4 duration-500 max-w-2xl mx-auto pb-12">
              <header className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Meu Perfil</h1>
                <p className="text-slate-500 font-medium">Mantenha seus dados atualizados para confirmações rápidas.</p>
              </header>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 bg-indigo-600 flex flex-col items-center gap-4 relative">
                  {isGuest && (
                    <div className="absolute top-4 right-4 animate-bounce">
                      <button
                        onClick={() => setIsGuest(false)}
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
                      className={`absolute -bottom-2 -right-2 bg-white text-indigo-600 p-2.5 rounded-xl shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-indigo-600 group-hover:rotate-12 ${isGuest ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <Camera size={18} strokeWidth={2.5} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-white text-xl font-bold tracking-tight leading-none">{isGuest ? 'Visualizando como Visitante' : (userProfile?.name || 'Seu Nome')}</h2>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-1">{isGuest ? 'Acesso Limitado' : (userProfile?.instrument || 'Instrumento')}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className={`p-8 space-y-6 ${isGuest ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isGuest && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 mb-4">
                      <Info className="text-amber-500" size={20} />
                      <p className="text-xs font-medium text-amber-700">Como visitante, suas edições no perfil não serão salvas. <button onClick={() => setIsGuest(false)} className="underline font-black">Crie uma conta</button> para gerenciar seu perfil musical.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <User size={14} /> Nome Completo
                      </label>
                      <input required name="name" defaultValue={userProfile?.name} type="text" placeholder="Como quer ser chamado?" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Phone size={14} /> WhatsApp
                      </label>
                      <input required name="phone" defaultValue={userProfile?.phone} type="tel" placeholder="(00) 00000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Music size={14} /> Instrumento Principal
                      </label>
                      <select name="instrument" defaultValue={userProfile?.instrument} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <MapPin size={14} /> Congregação Comum
                      </label>
                      <input name="congregation" defaultValue={userProfile?.congregation} type="text" placeholder="Sua congregação" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Camera size={14} /> URL da Foto de Perfil
                    </label>
                    <input
                      name="photoUrl"
                      value={userProfile?.photoUrl || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, photoUrl: e.target.value } : null)}
                      type="text"
                      placeholder="https://link-da-sua-foto.jpg ou Upload..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    {!isGuest && (
                      <button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700">
                        Salvar Perfil <CheckCircle size={20} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-6 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2 font-black text-xs"
                    >
                      <LogOut size={18} /> {isGuest ? 'SAIR DO MODO VISITANTE' : 'SAIR DA CONTA'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADMIN TAB */}
          {activeTab === 'admin' && (
            <div className="px-4 mt-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto mb-12">
              <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">Painel Administrativo</h1>
                  <p className="text-slate-500 font-medium">Gestão centralizada do sistema 2026.</p>
                </div>

                {/* Organized Sub-menu - Professional Tab System */}
                <div className="bg-white border border-slate-100 p-1 rounded-2xl shadow-sm flex flex-wrap lg:flex-nowrap gap-1 w-full lg:w-fit overflow-hidden">
                  <button
                    onClick={() => setAdminSubTab('events')}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${adminSubTab === 'events' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Calendar size={14} /> EVENTOS
                  </button>
                  <button
                    onClick={() => setAdminSubTab('congregations')}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${adminSubTab === 'congregations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Landmark size={14} /> CONGREGAÇÕES
                  </button>
                  <button
                    onClick={() => setAdminSubTab('conductors')}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${adminSubTab === 'conductors' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Users size={14} /> ENCARREGADOS
                  </button>
                  <button
                    onClick={() => setAdminSubTab('confirmations')}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${adminSubTab === 'confirmations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <CheckCircle size={14} /> CONFIRMAÇÕES
                  </button>
                </div>
              </header>

              {/* TAB: EVENTOS */}
              {adminSubTab === 'events' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Cronograma</h3>
                    <button
                      onClick={() => setIsCreatingEvent(true)}
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
                        <button onClick={clearFilters} className="ml-auto text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                          <RotateCcw size={14} /> Limpar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Mês</label>
                        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                          <option value="Todos">Todos</option>
                          {MONTHS_PT.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Local</label>
                        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                          {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Encarregado</label>
                        <select value={conductorFilter} onChange={(e) => setConductorFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                          {uniqueConductors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Tipo</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                          {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
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
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">{event.day.split(' ')[0]} {event.month} • {event.time}</span>
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
                                  <button onClick={() => toggleCancelEvent(event)} className={`p-2.5 rounded-xl transition-all ${event.canceled ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}>
                                    {event.canceled ? <CheckCircle size={18} /> : <X size={18} />}
                                  </button>
                                  <button onClick={() => { setSelectedEvent(event); setIsCreatingEvent(true); }} className="p-2.5 rounded-xl text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all">
                                    <Edit2 size={18} />
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

              {/* TAB: CONGREGAÇÕES */}
              {adminSubTab === 'congregations' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Congregações</h3>
                    <button
                      onClick={() => { setSelectedCongregation(null); setIsCreatingCongregation(true); }}
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    {filteredCongregations.map(cong => (
                      <div key={cong.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">{cong.category}</span>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{cong.name}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedCongregation(cong); setIsCreatingCongregation(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteCongregation(cong.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Localização</p>
                              <p className="text-sm font-medium text-slate-600">{cong.address}</p>
                              <p className="text-xs text-slate-400 font-bold">{cong.cep} • {cong.city}, {cong.state}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> Dias de Culto</p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {cong.serviceDays.map((sd, i) => (
                                  <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200 uppercase">{sd.day.slice(0, 3)} - {sd.time}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12} /> Ministério</p>
                              <div className="space-y-2 pt-1">
                                {cong.ministry.map((m, i) => (
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
                </div>
              )}

              {/* TAB: ENCARREGADOS */}
              {adminSubTab === 'conductors' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestão de Perfis</h3>
                    <button
                      onClick={() => { setSelectedConductor(null); setIsCreatingConductor(true); }}
                      className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-black hover:scale-105 transition-all"
                    >
                      <Plus size={16} /> NOVO PERFIL
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    {conductors.map(conductor => (
                      <ConductorProfileCard
                        key={conductor.id}
                        conductor={conductor}
                        onEdit={() => { setSelectedConductor(conductor); setIsCreatingConductor(true); }}
                        onDelete={() => deleteConductor(conductor.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: CONFIRMAÇÕES */}
              {adminSubTab === 'confirmations' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Lista de Confirmados</h3>
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
                          {filteredPresences.length > 0 ? (
                            filteredPresences.map((presence) => {
                              const event = events.find(e => e.id === presence.eventId);
                              const eventName = event ? getFriendlyEventName(event.type) : 'Evento';
                              const eventStyles = event ? getTypeStyles(event.type) : { text: 'text-slate-500', bg: 'bg-slate-100' };

                              return (
                                <tr key={presence.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                                        <User size={16} />
                                      </div>
                                      <div>
                                        <span className="font-bold block text-slate-800 tracking-tight leading-none truncate max-w-[120px]">{presence.name}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-1 uppercase tracking-tighter italic">{presence.phone || 'Sem Telefone'}</span>
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
                                        <span className="font-bold block text-slate-800 tracking-tight text-xs uppercase tracking-tighter leading-none">{event?.location || 'Não informado'}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">{event?.day.split(' ')[0]} {event?.month}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <button onClick={() => deletePresence(presence.id)} className="p-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-90">
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
                </div>
              )}
            </div>
          )
          }

          {/* MODALS */}
          {/* PRESENCE MODAL */}
          {
            isConfirming && selectedEvent && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className={`p-10 text-white flex justify-between items-center relative overflow-hidden ${getTypeStyles(selectedEvent.type).card}`}>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black tracking-tight">Confirmar Presença</h3>
                      <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">{getFriendlyEventName(selectedEvent.type)} • {selectedEvent.location}</p>
                    </div>
                    <button onClick={() => setIsConfirming(false)} className="bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all relative z-10 active:scale-90">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleConfirmPresence} className="p-10 space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                        <User size={14} /> Nome Completo
                      </label>
                      <input
                        required
                        name="name"
                        defaultValue={userProfile?.name}
                        type="text"
                        placeholder="Seu nome completo"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                          <Music size={14} /> Instrumento
                        </label>
                        <select
                          name="instrument"
                          defaultValue={userProfile?.instrument}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                        >
                          {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                          <Phone size={14} /> WhatsApp
                        </label>
                        <input
                          name="phone"
                          defaultValue={userProfile?.phone}
                          type="tel"
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <button type="submit" className={`w-full text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:scale-[1.02] ${getTypeStyles(selectedEvent.type).card}`}>
                      Confirmar agora <ChevronRight size={20} />
                    </button>
                  </form>
                </div>
              </div>
            )
          }

          {/* CREATE CONGREGATION MODAL */}
          {
            isCreatingCongregation && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-8 bg-indigo-600 text-white flex justify-between items-center flex-shrink-0">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{selectedCongregation ? 'Editar Congregação' : 'Nova Congregação'}</h3>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Gestão de Sedes e Locais de Culto</p>
                    </div>
                    <button onClick={() => setIsCreatingCongregation(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAddOrUpdateCongregation} className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1"><Landmark size={14} /> Nome da Congregação</label>
                        <input required name="name" defaultValue={selectedCongregation?.name} type="text" placeholder="Ex: Santa Terezinha" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1"><Filter size={14} /> Categoria</label>
                        <select name="category" defaultValue={selectedCongregation?.category || 'LOCAL'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                          <option value="CENTRAL">CENTRAL</option>
                          <option value="LOCAL">LOCAL</option>
                          <option value="DISTRITO">DISTRITO</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">Localização</h4>
                      <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logradouro</label>
                          <input required name="address" defaultValue={selectedCongregation?.address} type="text" placeholder="Rua, Número, Bairro" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                            <input name="cep" defaultValue={selectedCongregation?.cep} type="text" placeholder="00000-000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade / Estado</label>
                            <div className="flex gap-3">
                              <input required name="city" defaultValue={selectedCongregation?.city} type="text" placeholder="Cidade" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                              <input required name="state" defaultValue={selectedCongregation?.state || 'MG'} type="text" placeholder="UF" className="w-20 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-center" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2 flex justify-between">
                        Dias de Culto
                      </h4>
                      <div className="space-y-3">
                        {(selectedCongregation?.serviceDays.length ? selectedCongregation.serviceDays : [{ day: '', time: '' }]).map((sd, idx) => (
                          <div key={idx} className="flex gap-4">
                            <select name="serviceDay" defaultValue={sd.day} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                              <option value="">Selecione o Dia...</option>
                              {WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input name="serviceTime" defaultValue={sd.time} type="text" placeholder="19:30" className="w-32 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-center" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2 flex justify-between">
                        Ministério
                      </h4>
                      <div className="space-y-3">
                        {(selectedCongregation?.ministry.length ? selectedCongregation.ministry : [{ role: '', name: '' }]).map((m, idx) => (
                          <div key={idx} className="flex gap-4">
                            <select name="ministryRole" defaultValue={m.role} className="w-40 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                              <option value="">Cargo...</option>
                              <option value="Ancião">Ancião</option>
                              <option value="Diácono">Diácono</option>
                              <option value="Cooperador">Cooperador</option>
                            </select>
                            <input name="ministryName" defaultValue={m.name} type="text" placeholder="Nome Completo" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex-shrink-0">
                      <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700">
                        {selectedCongregation ? 'Atualizar Congregação' : 'Cadastrar Congregação'} <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {/* CREATE EVENT MODAL */}
          {
            isCreatingEvent && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-8 bg-slate-800 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{selectedEvent ? 'Editar Evento' : 'Novo Evento 2026'}</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{selectedEvent ? 'Atualização de Agendamento' : 'Configuração do Cronograma'}</p>
                    </div>
                    <button onClick={() => { setIsCreatingEvent(false); setSelectedEvent(null); }} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAddOrUpdateEvent} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <MapPin size={14} /> Localização / Distrito
                      </label>
                      <select required name="location" defaultValue={selectedEvent?.location} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        <option value="">Selecione o Local...</option>
                        {congregationList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <List size={14} /> Tipo de Evento
                      </label>
                      <select
                        name="type"
                        value={creatingEventType}
                        onChange={(e) => setCreatingEventType(e.target.value as EventType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      >
                        {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className={`space-y-1.5 transition-opacity ${isConductorDisabled ? 'opacity-40' : 'opacity-100'}`}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <User size={14} /> Encarregado
                      </label>
                      <input
                        required={!isConductorDisabled}
                        disabled={isConductorDisabled}
                        name="conductor"
                        defaultValue={selectedEvent?.conductor}
                        type="text"
                        placeholder={isConductorDisabled ? "N/A" : "Nome do encarregado"}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium ${isConductorDisabled ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Calendar size={14} /> Mês
                      </label>
                      <select name="month" defaultValue={selectedEvent?.month} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        {MONTHS_PT.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia (Número)</label>
                        <input required name="day" defaultValue={selectedEvent?.day.split(' ')[0]} type="number" min="1" max="31" placeholder="Ex: 15" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia (Semana)</label>
                        <select name="weekday" defaultValue={selectedEvent?.day.split('(')[1]?.replace(')', '')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Clock size={14} /> Horário
                      </label>
                      <input required name="time" defaultValue={selectedEvent?.time} type="text" placeholder="Ex: 17:00h" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="w-full bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-900">
                        {selectedEvent ? 'Salvar Alterações' : 'Salvar Novo Evento'} <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {
            isCreatingConductor && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{selectedConductor ? 'Editar Perfil' : 'Novo Encarregado'}</h3>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Gestão de Perfis de Música</p>
                    </div>
                    <button onClick={() => { setIsCreatingConductor(false); setSelectedConductor(null); }} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAddOrUpdateConductor} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <User size={14} /> Nome do Encarregado
                      </label>
                      <input required name="name" defaultValue={selectedConductor?.name} type="text" placeholder="Nome Completo" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Calendar size={14} /> Idade
                      </label>
                      <input required name="age" defaultValue={selectedConductor?.age} type="number" placeholder="Anos" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Music size={14} /> Instrumento
                      </label>
                      <select name="instrument" defaultValue={selectedConductor?.instrument} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <MapPin size={14} /> Congregação Comum
                      </label>
                      <select name="congregation" defaultValue={selectedConductor?.congregation} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        <option value="">Selecione...</option>
                        {congregationList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <List size={14} /> Tipo
                      </label>
                      <select name="type" defaultValue={selectedConductor?.type || ConductorType.LOCAL} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium">
                        <option value={ConductorType.LOCAL}>Local</option>
                        <option value={ConductorType.REGIONAL}>Regional</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Camera size={14} /> URL da Foto (Opcional)
                      </label>
                      <input name="photoUrl" defaultValue={selectedConductor?.photoUrl} type="url" placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>

                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700">
                        {selectedConductor ? 'Salvar Alterações' : 'Cadastrar Perfil'} <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

        </main>
      )}

      {isCropping && imageToCrop && (
        <ImageCropperModal
          image={imageToCrop}
          onCropComplete={onCropComplete}
          onCancel={() => {
            setIsCropping(false);
            setImageToCrop(null);
          }}
        />
      )}

      <Footer />

      {/* FAB Mobile */}
      {['events', 'admin'].includes(activeTab) && (
        <button
          onClick={() => { if (activeTab === 'admin') setIsCreatingEvent(true); else setActiveTab('events'); }}
          className="fixed bottom-24 right-6 bg-indigo-600 text-white p-5 rounded-[1.5rem] shadow-2xl shadow-indigo-300 z-40 hover:scale-110 active:scale-90 transition-all md:hidden border-4 border-white"
        >
          {activeTab === 'admin' ? <Plus size={28} /> : <List size={28} />}
        </button>
      )}
    </div>
  );
}
