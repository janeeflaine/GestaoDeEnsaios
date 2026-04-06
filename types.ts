
export enum EventType {
  LOCAL = 'Local',
  REGIONAL = 'REGIONAL',
  BATISMO = 'Batismo',
  BUSCA_DONS = 'Busca de Dons',
  REUNIAO_MOCIDADE = 'Reunião da Mocidade'
}

export interface EventTypeDefinition {
  id: number;
  name: string;
  value: string;
  color: string;
  text_color: string;
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
  congregationId: string;
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
  city?: string;
  state?: string;
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
  type: EventType | string;
  canceled?: boolean;
  deleted_at?: string | null;
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

// --- Statistics Module Types ---

export interface Anciao {
  id: number;
  name: string;
  congregation_id?: string;
}

export interface EventStatistic {
  id?: string;
  event_id?: string;
  congregation_id?: string;
  event_date: string;
  anciao_id?: number;
  anciao?: Anciao;
  enc_regionais?: Encarregado[];
  palavra?: string;
  hino_abertura?: number;
  hinos_ensaiados?: number;
  created_by?: string;
  created_at?: string;
  // Cordas
  violino: number; viola: number; violoncelo: number;
  // Madeiras
  flauta: number; oboe: number; oboe_damore: number; corne_ingles: number;
  fagote: number; clarinete: number; clarinete_alto: number; clarinete_baixo: number;
  sax_soprano: number; sax_alto: number; sax_tenor: number; sax_baritono: number; sax_baixo: number;
  // Metais
  trompete: number; cornet: number; flugelhorn: number; trompa: number;
  trombone: number; trombonito: number; baritono: number; eufonio: number; tuba: number;
  // Acordeon
  acordeon: number;
  // Ministério
  musicos: number; organistas: number; anciaes_presentes: number; diaconos: number;
  coop_oficio: number; coop_jovens: number; enc_regionais_presentes: number;
  enc_locais: number; examinadoras: number; secretarios_musica: number; instrutores: number;
}

export interface OrchestraFamilyTotals {
  cordas: number;
  madeiras: number;
  metais: number;
  acordeon: number;
  total: number;
}

export const IDEAL_PERCENTAGES = {
  cordas: 50,
  madeiras: 25,
  metais: 25,
} as const;

export const STAT_INSTRUMENTS = {
  cordas: [
    { key: 'violino', label: 'Violino' },
    { key: 'viola', label: 'Viola' },
    { key: 'violoncelo', label: 'Violoncelo' },
  ],
  madeiras: [
    { key: 'flauta', label: 'Flauta' },
    { key: 'oboe', label: 'Oboé' },
    { key: 'oboe_damore', label: "Oboé D'Amore" },
    { key: 'corne_ingles', label: 'Corne Inglês' },
    { key: 'fagote', label: 'Fagote' },
    { key: 'clarinete', label: 'Clarinete' },
    { key: 'clarinete_alto', label: 'Clarinete Alto' },
    { key: 'clarinete_baixo', label: 'Clarinete Baixo' },
    { key: 'sax_soprano', label: 'Sax - Soprano' },
    { key: 'sax_alto', label: 'Sax - Alto' },
    { key: 'sax_tenor', label: 'Sax - Tenor' },
    { key: 'sax_baritono', label: 'Sax - Barítono' },
    { key: 'sax_baixo', label: 'Sax - Baixo' },
  ],
  metais: [
    { key: 'trompete', label: 'Trompete' },
    { key: 'cornet', label: 'Cornet' },
    { key: 'flugelhorn', label: 'Flugelhorn' },
    { key: 'trompa', label: 'Trompa' },
    { key: 'trombone', label: 'Trombone' },
    { key: 'trombonito', label: 'Trombonito' },
    { key: 'baritono', label: 'Barítono' },
    { key: 'eufonio', label: 'Eufônio' },
    { key: 'tuba', label: 'Tuba' },
  ],
  acordeon: [
    { key: 'acordeon', label: 'Acordeon' },
  ],
} as const;

export const MINISTRY_FIELDS = [
  { key: 'musicos', label: 'Músicos' },
  { key: 'organistas', label: 'Organistas' },
  { key: 'anciaes_presentes', label: 'Anciães' },
  { key: 'diaconos', label: 'Diáconos' },
  { key: 'coop_oficio', label: 'Coop. do Ofício' },
  { key: 'coop_jovens', label: 'Coop. de Jovens' },
  { key: 'enc_regionais_presentes', label: 'Enc. Regionais' },
  { key: 'enc_locais', label: 'Enc. Locais' },
  { key: 'examinadoras', label: 'Examinadoras' },
  { key: 'secretarios_musica', label: 'Secretários da Música' },
  { key: 'instrutores', label: 'Instrutores / Instrutoras' },
] as const;
