
export enum EventType {
  LOCAL = 'Local',
  REGIONAL = 'REGIONAL',
  BATISMO = 'Batismo',
  BUSCA_DONS = 'Busca de Dons',
  REUNIAO_MOCIDADE = 'Reunião da Mocidade'
}

export enum ConductorType {
  LOCAL = 'Local',
  REGIONAL = 'Regional'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MUSICIAN = 'MUSICIAN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  instrument: string;
  congregation: string;
  photoUrl: string;
  role: UserRole;
}

export interface CongregationCategory {
  id: number;
  name: string;
}

export interface MinistryRole {
  id: number;
  name: string;
}

export interface Ministry {
  id?: number;
  role: string;
  name: string;
  profileId?: string;
}

export interface ServiceDay {
  day: string;
  time: string;
}

export interface Congregation {
  id: string;
  name: string;
  category: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  serviceDays: ServiceDay[];
  ministry: Ministry[];
}

export interface Encarregado {
  id: string;
  name: string;
  age: number;
  instrument: string;
  congregation: string;
  photoUrl: string;
  type: ConductorType;
}

export interface RehearsalEvent {
  id: string;
  month: string;
  day: string;
  fullDate: Date;
  location: string;
  time: string;
  conductor: string;
  type: EventType;
  canceled?: boolean;
}

export interface Presence {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  instrument: string;
  timestamp: Date;
}

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const INSTRUMENTS = [
  // Cordas
  'Violino', 'Viola', 'Violoncelo', 'Contrabaixo',
  // Madeiras
  'Flauta', 'Oboé', 'Corne Inglês', 'Fagote',
  'Clarinete', 'Clarinete Alto', 'Clarinete Baixo',
  'Saxofone Soprano', 'Saxofone Alto', 'Saxofone Tenor', 'Saxofone Barítono',
  // Metais
  'Trompete', 'Cornet', 'Flugelhorn', 'Trompa',
  'Trombone', 'Trombonito', 'Barítono', 'Eufônio', 'Tuba',
  // Teclas / Outros
  'Órgão', 'Acordeon', 'Outro'
];

export const WEEK_DAYS = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
];
