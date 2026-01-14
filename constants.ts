
import { EventType, RehearsalEvent, Encarregado, ConductorType, Congregation } from './types';

const rawData = `Janeiro,04 (Dom),Distrito São Roque,17:00h,Rafael,Local
Janeiro,10 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Janeiro,11 (Dom),Mutum,17:00h,Marcelo Martins,Local
Janeiro,24 (Sáb),Lajinha,17:00h,Marco Prote,Local
Janeiro,25 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Fevereiro,01 (Dom),Distrito São Roque,17:00h,Rafael,Local
Fevereiro,08 (Dom),Mutum,17:00h,Marcelo Martins,Local
Fevereiro,14 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Fevereiro,15 (Dom),Distrito Sede,09:00h,Ancião Local,Batismo
Fevereiro,22 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Fevereiro,28 (Sáb),Lajinha,17:00h,Marco Prote,Local
Março,01 (Dom),Distrito São Roque,17:00h,Rafael,Local
Março,08 (Dom),Mutum,17:00h,Marcelo Martins,Local
Março,14 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Março,15 (Dom),Sede Regional,14:00h,Regional,Busca de Dons
Março,22 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Março,28 (Sáb),Lajinha,17:00h,Marco Prote,Local
Março,29 (Dom),Centro de Eventos,18:00h,Mocidade,Reunião da Mocidade
Abril,05 (Dom),Lajinha,09:30h,Regional,REGIONAL
Abril,11 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Abril,12 (Dom),Mutum,17:00h,Marcelo Martins,Local
Abril,25 (Sáb),Lajinha,17:00h,Marco Prote,Local
Abril,26 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Maio,03 (Dom),Distrito São Roque,17:00h,Rafael,Local
Maio,09 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Maio,10 (Dom),Mutum,17:00h,Marcelo Martins,Local
Maio,17 (Dom),Distrito Sede,09:00h,Ancião Local,Batismo
Maio,23 (Sáb),Lajinha,17:00h,Marco Prote,Local
Maio,24 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Junho,07 (Dom),Distrito São Roque,17:00h,Rafael,Local
Junho,13 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Junho,14 (Dom),Mutum,17:00h,Marcelo Martins,Local
Junho,27 (Sáb),Lajinha,17:00h,Marco Prote,Local
Junho,28 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Junho,29 (Seg),Sede Regional,19:30h,Mocidade,Reunião da Mocidade
Julho,05 (Dom),Aimorés,09:30h,Regional,REGIONAL
Julho,11 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Julho,12 (Dom),Mutum,17:00h,Marcelo Martins,Local
Julho,25 (Sáb),Lajinha,17:00h,Marco Prote,Local
Julho,26 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Agosto,02 (Dom),Distrito São Roque,17:00h,Rafael,Local
Agosto,08 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Agosto,09 (Dom),Mutum,17:00h,Marcelo Martins,Local
Agosto,16 (Dom),Sede Regional,14:00h,Regional,Busca de Dons
Agosto,22 (Sáb),Lajinha,17:00h,Marco Prote,Local
Agosto,23 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Setembro,06 (Dom),Distrito São Roque,17:00h,Rafael,Local
Setembro,12 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Setembro,13 (Dom),Mutum,17:00h,Marcelo Martins,Local
Setembro,26 (Sáb),Lajinha,17:00h,Marco Prote,Local
Setembro,27 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Setembro,28 (Seg),Distrito Sede,09:00h,Ancião Local,Batismo
Outubro,04 (Dom),Distrito São Roque,17:00h,Rafael,Local
Outubro,10 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Outubro,11 (Dom),Mutum,17:00h,Marcelo Martins,Local
Outubro,18 (Dom),Mutum,09:30h,Regional,REGIONAL
Outubro,24 (Sáb),Lajinha,17:00h,Marco Prote,Local
Outubro,25 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Novembro,01 (Dom),Distrito São Roque,17:00h,Rafael,Local
Novembro,08 (Dom),Mutum,17:00h,Marcelo Martins,Local
Novembro,14 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Novembro,22 (Dom),Distrito Prata,17:00h,Daniel Assis,Local
Novembro,28 (Sáb),Lajinha,17:00h,Marco Prote,Local
Dezembro,06 (Dom),Distrito São Roque,17:00h,Rafael,Local
Dezembro,12 (Sáb),Aimorés,17:00h,Cleber Junior,Local
Dezembro,13 (Dom),Mutum,17:00h,Marcelo Martins,Local
Dezembro,26 (Sáb),Lajinha,17:00h,Marco Prote,Local
Dezembro,27 (Dom),Distrito Prata,17:00h,Daniel Assis,Local`;

const monthMap: { [key: string]: number } = {
  'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
  'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
};

export const INITIAL_EVENTS: RehearsalEvent[] = rawData.split('\n').map((line, index) => {
  const [month, dayStr, location, time, conductor, typeStr] = line.split(',');
  const day = parseInt(dayStr.split(' ')[0]);
  const fullDate = new Date(2026, monthMap[month], day);
  
  let finalType = EventType.LOCAL;
  const upperType = typeStr.toUpperCase();
  if (upperType.includes('REGIONAL')) finalType = EventType.REGIONAL;
  else if (upperType.includes('BATISMO')) finalType = EventType.BATISMO;
  else if (upperType.includes('BUSCA')) finalType = EventType.BUSCA_DONS;
  else if (upperType.includes('MOCIDADE')) finalType = EventType.REUNIAO_MOCIDADE;

  return {
    id: `event-${index}`,
    month,
    day: dayStr,
    fullDate,
    location,
    time,
    conductor,
    type: finalType,
  };
});

export const INITIAL_CONDUCTORS: Encarregado[] = [
  {
    id: 'cond-1',
    name: 'Rafael',
    age: 42,
    instrument: 'Violino',
    congregation: 'Distrito São Roque',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    type: ConductorType.LOCAL
  },
  {
    id: 'cond-2',
    name: 'Marcelo Martins',
    age: 38,
    instrument: 'Trompete',
    congregation: 'Mutum',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    type: ConductorType.LOCAL
  },
  {
    id: 'cond-3',
    name: 'Cleber Junior',
    age: 45,
    instrument: 'Saxofone Tenor',
    congregation: 'Aimorés',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    type: ConductorType.LOCAL
  },
  {
    id: 'cond-4',
    name: 'Regional',
    age: 50,
    instrument: 'Órgão',
    congregation: 'Sede Regional',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    type: ConductorType.REGIONAL
  }
];

export const INITIAL_CONGREGATIONS: Congregation[] = [
  {
    id: 'cong-1',
    name: 'Santa Terezinha',
    category: 'CENTRAL',
    address: 'Rua Antônio Francisco de Almeida, 112',
    cep: '36980-000',
    city: 'Lajinha',
    state: 'MG',
    serviceDays: [
      { day: 'Quinta-feira', time: '19:30' },
      { day: 'Sábado', time: '19:30' }
    ],
    ministry: [
      { role: 'Ancião', name: 'SILVINO PROTE' }
    ]
  },
  {
    id: 'cong-2',
    name: 'Distrito Prata',
    category: 'LOCAL',
    address: 'Av. Principal, s/n',
    cep: '36980-000',
    city: 'Lajinha',
    state: 'MG',
    serviceDays: [
      { day: 'Quarta-feira', time: '19:00' },
      { day: 'Domingo', time: '18:30' }
    ],
    ministry: [
      { role: 'Cooperador', name: 'DANIEL ASSIS' }
    ]
  }
];
