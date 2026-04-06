import { useState, useCallback } from 'react';
import type {
  RehearsalEvent,
  Encarregado,
  Congregation,
  Presence,
  UserProfile,
  CongregationCategory,
  MinistryRole,
  EventTypeDefinition,
} from '../types';
import * as eventsService from '../services/events';
import * as conductorsService from '../services/conductors';
import * as congregationsService from '../services/congregations';
import * as presencesService from '../services/presences';
import * as profilesService from '../services/profiles';
import * as configService from '../services/config';
import logger from '../utils/logger';

export function useAppData() {
  const [events, setEvents] = useState<RehearsalEvent[]>([]);
  const [conductors, setConductors] = useState<Encarregado[]>([]);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [categories, setCategories] = useState<CongregationCategory[]>([]);
  const [roles, setRoles] = useState<MinistryRole[]>([]);
  const [eventTypeList, setEventTypeList] = useState<EventTypeDefinition[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        eventsService.fetchEvents(),
        conductorsService.fetchConductors(),
        congregationsService.fetchCongregations(),
        presencesService.fetchPresences(),
        configService.fetchCategories(),
        configService.fetchRoles(),
        configService.fetchEventTypes(),
        profilesService.fetchAllProfiles(),
      ]);

      const [evts, conds, congs, pres, cats, rls, types, profs] = results;
      if (evts.status === 'fulfilled') setEvents(evts.value);
      else logger.error('Erro ao buscar eventos:', evts.reason);

      if (conds.status === 'fulfilled') setConductors(conds.value);
      else logger.error('Erro ao buscar encarregados:', conds.reason);

      if (congs.status === 'fulfilled') setCongregations(congs.value);
      else logger.error('Erro ao buscar congregações:', congs.reason);

      if (pres.status === 'fulfilled') setPresences(pres.value);
      else logger.error('Erro ao buscar presenças:', pres.reason);

      if (cats.status === 'fulfilled') setCategories(cats.value);
      if (rls.status === 'fulfilled') setRoles(rls.value);
      if (types.status === 'fulfilled') setEventTypeList(types.value);
      if (profs.status === 'fulfilled') setAllProfiles(profs.value);
    } catch (error) {
      logger.error('Erro geral ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    try { const d = await eventsService.fetchEvents(); setEvents(d); }
    catch (error) { logger.error('Erro ao atualizar eventos:', error); }
  }, []);

  const refreshConductors = useCallback(async () => {
    try { const d = await conductorsService.fetchConductors(); setConductors(d); }
    catch (error) { logger.error('Erro ao atualizar encarregados:', error); }
  }, []);

  const refreshCongregations = useCallback(async () => {
    try { const d = await congregationsService.fetchCongregations(); setCongregations(d); }
    catch (error) { logger.error('Erro ao atualizar congregações:', error); }
  }, []);

  const refreshPresences = useCallback(async () => {
    try { const d = await presencesService.fetchPresences(); setPresences(d); }
    catch (error) { logger.error('Erro ao atualizar presenças:', error); }
  }, []);

  const refreshProfiles = useCallback(async () => {
    try { const d = await profilesService.fetchAllProfiles(); setAllProfiles(d); }
    catch (error) { logger.error('Erro ao atualizar perfis:', error); }
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      const [cats, rls, types] = await Promise.all([
        configService.fetchCategories(),
        configService.fetchRoles(),
        configService.fetchEventTypes(),
      ]);
      setCategories(cats); setRoles(rls); setEventTypeList(types);
    } catch (error) { logger.error('Erro ao atualizar configurações:', error); }
  }, []);

  return {
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
  };
}
