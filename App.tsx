import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Plus } from 'lucide-react';
import {
  RehearsalEvent,
  EventType,
  Encarregado,
  Congregation,
  UserProfile,
  CongregationCategory,
  MinistryRole,
  EventTypeDefinition,
  ServiceDay,
  Ministry,
  UserRole,
} from './types';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import ImageCropperModal from './components/ImageCropper';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from './components/Toast';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';

// Lazy-loaded pages (heavy)
const StatisticsDashboard = lazy(() => import('./components/StatisticsDashboard'));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AiPage = lazy(() => import('./pages/AiPage').then(m => ({ default: m.AiPage })));
const SharedStatPage = lazy(() => import('./pages/SharedStatPage').then(m => ({ default: m.SharedStatPage })));

// Modals
import { PresenceModal } from './components/modals/PresenceModal';
import { EventModal } from './components/modals/EventModal';
import { ConductorModal } from './components/modals/ConductorModal';
import { CongregationModal } from './components/modals/CongregationModal';
import { EditMemberModal } from './components/modals/EditMemberModal';
import { DeleteMemberModal } from './components/modals/DeleteMemberModal';
import { DeleteEventModal } from './components/modals/DeleteEventModal';

// Hooks & services
import { useAppData } from './hooks/useAppData';
import { useToast } from './hooks/useToast';
import * as eventsService from './services/events';
import * as conductorsService from './services/conductors';
import * as congregationsService from './services/congregations';
import * as presencesService from './services/presences';
import * as profilesService from './services/profiles';
import * as configService from './services/config';

import { getFriendlyEventName } from './utils/eventHelpers';
import logger from './utils/logger';
import { getStatByShareToken } from './services/statistics';
import type { EventStatistic } from './types';


export default function App() {
  // ── Auth state ────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isGuest = !session;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const exitGuest = () => setShowAuthModal(true);

  // ── Shared stat (via ?stat_share=TOKEN in URL) ────────────────
  const [sharedStat, setSharedStat] = useState<EventStatistic | null>(null);
  const [sharedStatLoading, setSharedStatLoading] = useState(false);

  // ── Navigation ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<
    'events' | 'conductors' | 'confirmations' | 'congregations' | 'users' | 'settings'
  >('events');

  // ── Data ─────────────────────────────────────────────────────
  const {
    events,
    conductors,
    congregations,
    presences,
    categories,
    roles,
    eventTypeList,
    allProfiles,
    isLoading,
    fetchAll,
    refreshEvents,
    refreshConductors,
    refreshCongregations,
    refreshPresences,
    refreshProfiles,
    refreshConfig,
  } = useAppData();

  // ── Toast ────────────────────────────────────────────────────
  const { toasts, showToast, removeToast } = useToast();

  // ── Modal state ───────────────────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<RehearsalEvent | null>(null);
  const [selectedConductor, setSelectedConductor] = useState<Encarregado | null>(null);
  const [selectedCongregation, setSelectedCongregation] = useState<Congregation | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<RehearsalEvent | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingConductor, setIsCreatingConductor] = useState(false);
  const [isCreatingCongregation, setIsCreatingCongregation] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<UserProfile | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<UserProfile | null>(null);

  // ── Form / UI state ───────────────────────────────────────────
  const [creatingEventType, setCreatingEventType] = useState<string>(EventType.LOCAL);
  const [tempServiceDays, setTempServiceDays] = useState<ServiceDay[]>([]);
  const [tempMinistry, setTempMinistry] = useState<Ministry[]>([]);
  const [editingCategory, setEditingCategory] = useState<CongregationCategory | null>(null);
  const [editingRole, setEditingRole] = useState<MinistryRole | null>(null);
  const [editingEventType, setEditingEventType] = useState<EventTypeDefinition | null>(null);

  // Profile form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instrument: 'Violino',
    congregation: '',
    congregationId: '',
    photoUrl: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Photo upload
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('Todos');
  const [conductorFilter, setConductorFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [presenceSearch, setPresenceSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [congregationSearch, setCongregationSearch] = useState('');

  // ── Auth listener ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsCheckingSession(false);
      if (s) fetchUserProfileData(s.user.id, s);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        fetchUserProfileData(s.user.id, s);
        setShowAuthModal(false);
      }
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Detect ?stat_share=TOKEN on mount ─────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('stat_share');
    if (!token) return;
    setSharedStatLoading(true);
    setActiveTab('statistics');
    getStatByShareToken(token)
      .then((stat) => { if (stat) setSharedStat(stat); })
      .catch((err) => logger.error('share token lookup failed', err))
      .finally(() => setSharedStatLoading(false));
  }, []);

  const fetchUserProfileData = async (userId: string, currentSession?: Session) => {
    const profile = await profilesService.fetchUserProfile(userId);
    if (profile) {
      setUserProfile(profile);
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        instrument: profile.instrument || 'Violino',
        congregation: profile.congregation || '',
        congregationId: (profile as UserProfile & { congregation_id?: string }).congregation_id || '',
        photoUrl: profile.photoUrl || '',
      });
    } else {
      const metadata = currentSession?.user?.user_metadata;
      setFormData({
        name: metadata?.name || '',
        phone: '',
        instrument: metadata?.instrument || 'Violino',
        congregation: '',
        congregationId: '',
        photoUrl: '',
      });
    }
  };

  // ── Derived data ──────────────────────────────────────────────
  const today = new Date();

  const congregationList = useMemo(() => {
    const list = congregations.map((c) => c.name);
    if (userProfile?.congregation && !list.includes(userProfile.congregation)) {
      list.push(userProfile.congregation);
    }
    return [...new Set(list)].sort();
  }, [congregations, userProfile?.congregation]);

  const dashboardData = useMemo(() => {
    let futureEvents = events
      .filter((e) => e.fullDate >= today && !e.canceled)
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    if (globalSearch) {
      futureEvents = futureEvents.filter(
        (e) =>
          e.location.toLowerCase().includes(globalSearch.toLowerCase()) ||
          e.conductor.toLowerCase().includes(globalSearch.toLowerCase())
      );
    }

    return { largeEvents: futureEvents.slice(0, 4), smallEvents: futureEvents.slice(4, 8) };
  }, [events, today, globalSearch]);

  const stats = useMemo(() => {
    const activeEvents = events.filter((e) => !e.canceled);
    const countStats = (types: string[]) => {
      const filtered = activeEvents.filter((e) => types.includes(e.type));
      return { total: filtered.length, remaining: filtered.filter((e) => e.fullDate >= today).length };
    };
    return {
      total: countStats(Object.values(EventType)),
      rehearsals: countStats([EventType.LOCAL, EventType.REGIONAL]),
      baptisms: countStats([EventType.BATISMO]),
      youth: countStats([EventType.REUNIAO_MOCIDADE]),
      gifts: countStats([EventType.BUSCA_DONS]),
      presences: presences.length,
    };
  }, [events, today, presences]);

  const uniqueConductors = useMemo(
    () => ['Todos', ...new Set(conductors.map((c) => c.name))].sort(),
    [conductors]
  );
  const uniqueLocations = useMemo(
    () => ['Todos', ...new Set(congregations.map((c) => c.name))].sort(),
    [congregations]
  );
  const eventTypes = useMemo(() => ['Todos', ...eventTypeList.map((t) => t.name)], [eventTypeList]);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (monthFilter !== 'Todos') list = list.filter((e) => e.month === monthFilter);
    if (conductorFilter !== 'Todos') list = list.filter((e) => e.conductor === conductorFilter);
    if (locationFilter !== 'Todos') list = list.filter((e) => e.location === locationFilter);
    if (typeFilter !== 'Todos') {
      const typeDef = eventTypeList.find((t) => t.name === typeFilter);
      list = list.filter((e) => {
        if (!typeDef) return e.type === typeFilter;
        return e.type === typeDef.name || e.type === typeDef.value;
      });
    }
    return list.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [events, monthFilter, conductorFilter, locationFilter, typeFilter, eventTypeList]);

  const filteredPresences = useMemo(() => {
    let list = presences;
    if (presenceSearch) {
      const search = presenceSearch.toLowerCase();
      list = list.filter((p) => {
        const event = events.find((e) => e.id === p.eventId);
        return (
          p.name.toLowerCase().includes(search) ||
          p.instrument.toLowerCase().includes(search) ||
          event?.location.toLowerCase().includes(search) ||
          getFriendlyEventName(event?.type || EventType.LOCAL).toLowerCase().includes(search)
        );
      });
    }
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [presences, events, presenceSearch]);

  const filteredCongregations = useMemo(() => {
    let list = congregations;
    if (congregationSearch) {
      const search = congregationSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.city.toLowerCase().includes(search) ||
          c.category.toLowerCase().includes(search)
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [congregations, congregationSearch]);

  const hasActiveFilters =
    monthFilter !== 'Todos' ||
    conductorFilter !== 'Todos' ||
    locationFilter !== 'Todos' ||
    typeFilter !== 'Todos';

  const clearFilters = () => {
    setMonthFilter('Todos');
    setConductorFilter('Todos');
    setLocationFilter('Todos');
    setTypeFilter('Todos');
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleConfirmPresence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPresence = {
      id: crypto.randomUUID(),
      event_id: selectedEvent?.id || '',
      name: fd.get('name') as string,
      email: (fd.get('email') as string) || '',
      phone: fd.get('phone') as string,
      instrument: fd.get('instrument') as string,
    };
    try {
      await presencesService.insertPresence(newPresence);
      await refreshPresences();
      setIsConfirming(false);
      setSelectedEvent(null);
      showToast('Presença confirmada com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao confirmar presença: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleAddOrUpdateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const month = fd.get('month') as string;
    const dayValue = fd.get('day') as string;
    const weekday = fd.get('weekday') as string;
    const type = fd.get('type') as EventType;
    const monthIndex = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].indexOf(month);
    const needsConductor = ![EventType.BATISMO, EventType.BUSCA_DONS, EventType.REUNIAO_MOCIDADE].includes(type);

    const eventData = {
      id: selectedEvent ? selectedEvent.id : crypto.randomUUID(),
      month,
      day: `${dayValue.padStart(2, '0')} (${weekday})`,
      full_date: new Date(new Date().getFullYear(), monthIndex, parseInt(dayValue)).toISOString(),
      location: fd.get('location') as string,
      time: fd.get('time') as string,
      conductor: needsConductor ? (fd.get('conductor') as string) : 'Coletivo',
      type,
    };

    try {
      await eventsService.upsertEvent(eventData);
      await refreshEvents();
      setIsCreatingEvent(false);
      setSelectedEvent(null);
      showToast(selectedEvent ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar evento: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleAddOrUpdateConductor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const conductorData = {
      id: selectedConductor?.id || crypto.randomUUID(),
      name,
      age: parseInt(fd.get('age') as string),
      instrument: fd.get('instrument') as string,
      congregation: fd.get('congregation') as string,
      type: fd.get('type') as string,
      photo_url:
        (fd.get('photoUrl') as string) ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    };
    try {
      await conductorsService.upsertConductor(conductorData);
      await refreshConductors();
      setIsCreatingConductor(false);
      setSelectedConductor(null);
      showToast(selectedConductor ? 'Perfil atualizado!' : 'Encarregado cadastrado!', 'success');
    } catch (err) {
      showToast('Erro ao salvar encarregado: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleAddOrUpdateCongregation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (tempServiceDays.length === 0) {
      showToast('Adicione ao menos um dia de culto.', 'warning');
      return;
    }
    const congregationId = selectedCongregation?.id || crypto.randomUUID();
    const congregationData = {
      id: congregationId,
      name: fd.get('name') as string,
      category: fd.get('category') as string,
      address: fd.get('address') as string,
      cep: fd.get('cep') as string,
      city: fd.get('city') as string,
      state: fd.get('state') as string,
    };
    try {
      await congregationsService.upsertCongregation(congregationData);
      if (selectedCongregation) {
        await congregationsService.replaceServiceDays(congregationId, tempServiceDays);
        await congregationsService.replaceMinistry(congregationId, tempMinistry);
      } else {
        await congregationsService.replaceServiceDays(congregationId, tempServiceDays);
        await congregationsService.replaceMinistry(congregationId, tempMinistry);
      }
      await refreshCongregations();
      setIsCreatingCongregation(false);
      setSelectedCongregation(null);
      showToast(selectedCongregation ? 'Congregação atualizada!' : 'Congregação cadastrada!', 'success');
    } catch (err) {
      showToast('Erro ao salvar congregação: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
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
    setUserProfile((prev) =>
      prev
        ? { ...prev, photoUrl: croppedImage }
        : { id: '', role: 'USER' as UserRole, name: '', email: '', phone: '', instrument: 'Violino', photoUrl: croppedImage, congregation: '', congregationId: '' }
    );
    setFormData((prev) => ({ ...prev, photoUrl: croppedImage }));
    setIsCropping(false);
    setImageToCrop(null);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.log('Salvando perfil...', formData);
    if (isGuest || !session?.user) {
      showToast('Faça login para salvar seu perfil permanentemente.', 'warning');
      return;
    }
    const profileToSave = {
      id: session.user.id,
      email: session.user.email,
      name: formData.name,
      phone: formData.phone,
      instrument: formData.instrument,
      congregation: formData.congregation,
      congregation_id: formData.congregationId,
      photo_url: formData.photoUrl,
      role: userProfile?.role || 'USER',
    };
    try {
      await profilesService.upsertProfile(profileToSave);
      setUserProfile((prev) => ({
        ...prev,
        id: profileToSave.id,
        email: profileToSave.email || '',
        role: (profileToSave.role as UserRole) || UserRole.USER,
        name: profileToSave.name,
        phone: profileToSave.phone,
        instrument: profileToSave.instrument,
        congregation: profileToSave.congregation,
        congregationId: profileToSave.congregation_id,
        photoUrl: profileToSave.photo_url,
      }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      showToast('Erro ao salvar: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('Erro inesperado no logout:', err);
    } finally {
      setSession(null);
      setUserProfile(null);
      setActiveTab('dashboard');
    }
  };

  const handleDeleteConductor = async (id: string) => {
    if (confirm('Deseja realmente excluir este perfil?')) {
      try {
        await conductorsService.deleteConductor(id);
        await refreshConductors();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  const handleDeleteCongregation = async (id: string) => {
    if (confirm('Deseja realmente excluir esta congregação?')) {
      try {
        await congregationsService.deleteCongregation(id);
        await refreshCongregations();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  const handleDeletePresence = async (id: string) => {
    if (confirm('Deseja realmente remover esta confirmação?')) {
      try {
        await presencesService.deletePresence(id);
        await refreshPresences();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  const openDeleteEventModal = (event: RehearsalEvent) => {
    setEventToDelete(event);
    setIsDeletingEvent(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await eventsService.deleteEvent(eventToDelete.id);
      await refreshEvents();
      setIsDeletingEvent(false);
      setEventToDelete(null);
      showToast('Evento excluído com sucesso.', 'success');
    } catch (err) {
      logger.error('Erro na exclusão:', err);
      showToast('Ocorreu um erro inesperado ao excluir o evento.', 'error');
    }
  };

  const handleToggleCancelEvent = async (event: RehearsalEvent) => {
    try {
      await eventsService.updateEventStatus(event.id, !event.canceled);
      await refreshEvents();
    } catch (err) {
      showToast('Erro ao alterar status: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const updateUserProfile = async (
    userId: string,
    updates: Partial<UserProfile> & { congregation_id?: string | null }
  ) => {
    logger.log('updateUserProfile called:', { userId, updates });
    try {
      const data = await profilesService.updateProfile(userId, updates as Record<string, unknown>);
      if (!data || data.length === 0) {
        showToast('Atenção: A alteração não foi salva. Verifique se você tem permissão de Administrador.', 'warning');
      } else {
        await refreshProfiles();
      }
    } catch (err: unknown) {
      showToast('Erro ao atualizar usuário: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleDeleteMember = async (profile: UserProfile) => {
    try {
      const data = await profilesService.deleteProfile(profile.id);
      if (!data || data.length === 0) {
        showToast('Não foi possível excluir o membro. Verifique suas permissões.', 'warning');
        return;
      }
      await refreshProfiles();
      setIsDeletingMember(false);
      setMemberToDelete(null);
    } catch (err: unknown) {
      showToast('Erro ao excluir membro: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  // Config CRUD
  const addCategory = async (name: string) => {
    try {
      if (editingCategory) {
        await configService.updateCategory(editingCategory.id, name);
        setEditingCategory(null);
      } else {
        await configService.insertCategory(name);
      }
      await refreshConfig();
    } catch (err) {
      showToast('Erro ao salvar categoria: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const deleteCategory = async (id: number) => {
    if (confirm('Deseja realmente excluir esta categoria?')) {
      try {
        await configService.deleteCategory(id);
        await refreshConfig();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  const addRole = async (name: string) => {
    try {
      if (editingRole) {
        await configService.updateRole(editingRole.id, name);
        setEditingRole(null);
      } else {
        await configService.insertRole(name);
      }
      await refreshConfig();
    } catch (err) {
      showToast('Erro ao salvar cargo: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const deleteRole = async (id: number) => {
    if (confirm('Deseja realmente excluir este cargo?')) {
      try {
        await configService.deleteRole(id);
        await refreshConfig();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  const addEventType = async (name: string, value: string, color: string, textColor: string) => {
    if (!name || !value) return;
    const payload = { name, value, color, text_color: textColor };
    try {
      if (editingEventType) {
        await configService.updateEventType(editingEventType.id, payload);
        setEditingEventType(null);
      } else {
        await configService.insertEventType(payload);
      }
      await refreshConfig();
    } catch (err) {
      showToast('Erro ao salvar tipo: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const deleteEventType = async (id: number) => {
    if (confirm('Deseja realmente excluir este tipo de evento?')) {
      try {
        await configService.deleteEventType(id);
        await refreshConfig();
      } catch (err) {
        showToast('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    }
  };

  // ── Guard ─────────────────────────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24 flex flex-col min-h-screen selection:bg-indigo-100 selection:text-indigo-900 bg-slate-50 relative">
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900">
          <Auth onClose={() => setShowAuthModal(false)} />
        </div>
      )}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={userProfile}
        isGuest={isGuest}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <main className="max-w-6xl mx-auto w-full flex-grow">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>

          {activeTab === 'dashboard' && (
            <DashboardPage
              dashboardData={dashboardData}
              stats={stats}
              isLoading={isLoading}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              eventTypeList={eventTypeList}
              setActiveTab={setActiveTab}
              onConfirmEvent={(event) => { setSelectedEvent(event); setIsConfirming(true); }}
            />
          )}

          {activeTab === 'events' && (
            <EventsPage
              filteredEvents={filteredEvents}
              eventTypeList={eventTypeList}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
              conductorFilter={conductorFilter}
              setConductorFilter={setConductorFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              uniqueConductors={uniqueConductors}
              uniqueLocations={uniqueLocations}
              eventTypes={eventTypes}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              today={today}
              onConfirmEvent={(event) => { setSelectedEvent(event); setIsConfirming(true); }}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              userProfile={userProfile}
              isGuest={isGuest}
              onLoginClick={exitGuest}
              formData={formData}
              setFormData={setFormData}
              showSuccess={showSuccess}
              congregations={congregations}
              fileInputRef={fileInputRef}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onFileSelect={handleFileSelect}
            />
          )}

          {activeTab === 'admin' && userProfile?.role !== 'ADMIN' && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
              <p className="font-bold text-lg text-slate-600">Acesso Restrito</p>
              <p className="text-sm">Você não tem permissão para acessar o painel de administração.</p>
            </div>
          )}

          {activeTab === 'admin' && userProfile?.role === 'ADMIN' && (
            <AdminPage
              adminSubTab={adminSubTab}
              setAdminSubTab={setAdminSubTab}
              events={events}
              conductors={conductors}
              congregations={congregations}
              presences={presences}
              categories={categories}
              roles={roles}
              eventTypeList={eventTypeList}
              allProfiles={allProfiles}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
              conductorFilter={conductorFilter}
              setConductorFilter={setConductorFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              filteredEvents={filteredEvents}
              filteredPresences={filteredPresences}
              filteredCongregations={filteredCongregations}
              uniqueConductors={uniqueConductors}
              uniqueLocations={uniqueLocations}
              eventTypes={eventTypes}
              memberSearch={memberSearch}
              setMemberSearch={setMemberSearch}
              congregationSearch={congregationSearch}
              setCongregationSearch={setCongregationSearch}
              presenceSearch={presenceSearch}
              setPresenceSearch={setPresenceSearch}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
              editingRole={editingRole}
              setEditingRole={setEditingRole}
              editingEventType={editingEventType}
              setEditingEventType={setEditingEventType}
              onNewEvent={() => { setSelectedEvent(null); setCreatingEventType(EventType.LOCAL); setIsCreatingEvent(true); }}
              onEditEvent={(event) => { setSelectedEvent(event); setCreatingEventType(event.type); setIsCreatingEvent(true); }}
              onNewConductor={() => { setSelectedConductor(null); setIsCreatingConductor(true); }}
              onEditConductor={(conductor) => { setSelectedConductor(conductor); setIsCreatingConductor(true); }}
              onNewCongregation={() => {
                setSelectedCongregation(null);
                setTempServiceDays([{ day: '', time: '19:30' }]);
                setTempMinistry([{ role: '', name: '' }]);
                setIsCreatingCongregation(true);
              }}
              onEditCongregation={(cong) => {
                setSelectedCongregation(cong);
                setTempServiceDays(cong.serviceDays.length ? cong.serviceDays : [{ day: '', time: '19:30' }]);
                setTempMinistry(cong.ministry.length ? cong.ministry : [{ role: '', name: '' }]);
                setIsCreatingCongregation(true);
              }}
              onEditMember={(profile) => { setMemberToEdit(profile); setIsMemberModalOpen(true); }}
              onDeleteMember={(profile) => { setMemberToDelete(profile); setIsDeletingMember(true); }}
              onToggleCancelEvent={handleToggleCancelEvent}
              onDeleteEvent={openDeleteEventModal}
              onDeleteConductor={handleDeleteConductor}
              onDeleteCongregation={handleDeleteCongregation}
              onDeletePresence={handleDeletePresence}
              onUpdateUserProfile={updateUserProfile}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              onAddRole={addRole}
              onDeleteRole={deleteRole}
              onAddEventType={addEventType}
              onDeleteEventType={deleteEventType}
            />
          )}

          {activeTab === 'ia' && !isGuest && (
            <AiPage userProfile={userProfile} statsSummary={null} />
          )}

          {activeTab === 'statistics' && (
            sharedStat ? (
              <SharedStatPage
                stat={sharedStat}
                congregations={congregations}
                isGuest={isGuest}
                isAuthenticated={!!session}
                userId={userProfile?.id}
                onBack={() => setSharedStat(null)}
                onSavedCopy={() => setSharedStat(null)}
                onGoToProfile={() => setActiveTab('profile')}
                showToast={showToast}
              />
            ) : sharedStatLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <StatisticsDashboard
                congregations={congregations}
                events={events}
                isGuest={isGuest}
                userId={userProfile?.id}
                userRole={userProfile?.role}
                userName={userProfile?.name}
                onGoToProfile={() => setActiveTab('profile')}
              />
            )
          )}
        </Suspense>
      </main>

      {/* ── Modals ── */}
      {isConfirming && selectedEvent && (
        <PresenceModal
          event={selectedEvent}
          userProfile={userProfile}
          eventTypeList={eventTypeList}
          onClose={() => { setIsConfirming(false); setSelectedEvent(null); }}
          onSubmit={handleConfirmPresence}
        />
      )}

      {isCreatingEvent && (
        <EventModal
          event={selectedEvent}
          creatingEventType={creatingEventType}
          setCreatingEventType={setCreatingEventType}
          congregationList={congregationList}
          eventTypeList={eventTypeList}
          uniqueConductors={uniqueConductors}
          onClose={() => { setIsCreatingEvent(false); setSelectedEvent(null); }}
          onSubmit={handleAddOrUpdateEvent}
        />
      )}

      {isCreatingConductor && (
        <ConductorModal
          conductor={selectedConductor}
          congregationList={congregationList}
          onClose={() => { setIsCreatingConductor(false); setSelectedConductor(null); }}
          onSubmit={handleAddOrUpdateConductor}
        />
      )}

      {isCreatingCongregation && (
        <CongregationModal
          congregation={selectedCongregation}
          categories={categories}
          roles={roles}
          allProfiles={allProfiles}
          tempServiceDays={tempServiceDays}
          setTempServiceDays={setTempServiceDays}
          tempMinistry={tempMinistry}
          setTempMinistry={setTempMinistry}
          onClose={() => { setIsCreatingCongregation(false); setSelectedCongregation(null); }}
          onSubmit={handleAddOrUpdateCongregation}
        />
      )}

      {isMemberModalOpen && memberToEdit && (
        <EditMemberModal
          member={memberToEdit}
          congregations={congregations}
          onClose={() => { setIsMemberModalOpen(false); setMemberToEdit(null); }}
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const congId = fd.get('congregationId') as string;
            const updates = {
              name: fd.get('name') as string,
              phone: fd.get('phone') as string,
              instrument: fd.get('instrument') as string,
              role: fd.get('role') as UserRole,
              congregation_id: congId || null,
            };
            await updateUserProfile(memberToEdit.id, updates);
            setIsMemberModalOpen(false);
            setMemberToEdit(null);
          }}
        />
      )}

      {isDeletingMember && memberToDelete && (
        <DeleteMemberModal
          member={memberToDelete}
          onClose={() => { setIsDeletingMember(false); setMemberToDelete(null); }}
          onConfirm={handleDeleteMember}
        />
      )}

      {isDeletingEvent && eventToDelete && (
        <DeleteEventModal
          event={eventToDelete}
          onClose={() => { setIsDeletingEvent(false); setEventToDelete(null); }}
          onConfirm={confirmDeleteEvent}
        />
      )}

      {isCropping && imageToCrop && (
        <ImageCropperModal
          image={imageToCrop}
          onCropComplete={onCropComplete}
          onCancel={() => { setIsCropping(false); setImageToCrop(null); }}
        />
      )}

      <Footer />

      {/* FAB Mobile */}
      {['events', 'admin'].includes(activeTab) && (
        <button
          onClick={() => {
            if (activeTab === 'admin') {
              setSelectedEvent(null);
              setCreatingEventType(EventType.LOCAL);
              setIsCreatingEvent(true);
            } else {
              setActiveTab('events');
            }
          }}
          className="fixed bottom-24 right-6 bg-indigo-600 text-white p-5 rounded-[1.5rem] shadow-2xl shadow-indigo-300 z-40 hover:scale-110 active:scale-90 transition-all md:hidden border-4 border-white"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
