
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
  hinos_ensaiados_lista?: number[];
  created_by?: string;
  created_at?: string;
  share_token?: string;
  anciao_nome_custom?: string;
  enc_regionais_nomes_custom?: string[];
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
  // Ministério (auto-calc)
  musicos: number; organistas: number;
  // Ministério
  anciaes_presentes: number; diaconos: number; coop_oficio: number; coop_jovens: number;
  // Encarregados Musicais
  enc_regionais_presentes: number; examinadoras: number;
  // Legacy (kept for DB compat)
  enc_locais: number;
  // GEM
  secretarios_gem: number; secretaria_gem: number; instrutores: number; instrutoras: number;
  candidatas: number; candidatos: number;
  // Colaboradores
  secretarios_musica: number; secretaria_musica: number; auxiliar_porta: number;
  colaborador: number; colaboradora: number;
  // Irmandade
  irmas: number; irmaos: number;
}

export interface PendingAnciao {
  id: string;
  name: string;
  requested_by?: string;
  requester_name?: string;
  stat_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface PendingConductor {
  id: string;
  name: string;
  congregation?: string;
  requested_by?: string;
  requester_name?: string;
  stat_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
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

export const MINISTRY_GROUPS = [
  {
    label: 'Ministério',
    fields: [
      { key: 'anciaes_presentes', label: 'Anciões' },
      { key: 'diaconos', label: 'Diáconos' },
      { key: 'coop_oficio', label: 'Cooperador do O. M.' },
      { key: 'coop_jovens', label: 'Cooperador de J. e M.' },
    ],
  },
  {
    label: 'Encarregados Musicais',
    fields: [
      { key: 'enc_regionais_presentes', label: 'Encarregado Regional' },
      { key: 'examinadoras', label: 'Examinadora' },
    ],
  },
  {
    label: 'GEM',
    fields: [
      { key: 'secretarios_gem', label: 'Secretários do GEM' },
      { key: 'secretaria_gem', label: 'Secretária do GEM' },
      { key: 'instrutores', label: 'Instrutores' },
      { key: 'instrutoras', label: 'Instrutoras' },
      { key: 'candidatas', label: 'Candidatas' },
      { key: 'candidatos', label: 'Candidatos' },
    ],
  },
  {
    label: 'Colaboradores',
    fields: [
      { key: 'secretarios_musica', label: 'Secretário da Música' },
      { key: 'secretaria_musica', label: 'Secretária da Música' },
      { key: 'auxiliar_porta', label: 'Auxiliar na Porta' },
      { key: 'colaborador', label: 'Colaborador' },
      { key: 'colaboradora', label: 'Colaboradora' },
    ],
  },
  {
    label: 'Irmandade',
    fields: [
      { key: 'irmas', label: 'Irmãs' },
      { key: 'irmaos', label: 'Irmãos' },
    ],
  },
] as const;

/** Flat list of all ministry field keys (for backward compat / PDF) */
export const MINISTRY_FIELDS = MINISTRY_GROUPS.flatMap(g => g.fields);
