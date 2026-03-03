export interface Vote {
  id: string;
  date: string;
  description: string;
  type: 'Sim' | 'Não' | 'Abstenção' | 'Ausência';
  projectNumber: string;
  result: 'Aprovado' | 'Rejeitado' | 'Em Tramitação';
}

export const votesData: Vote[] = [
  { id: '1', date: '15/05/2024', description: 'Projeto de Lei 1234/2024 - Reforma Tributária', type: 'Sim', projectNumber: 'PL 1234/2024', result: 'Aprovado' },
  { id: '2', date: '10/05/2024', description: 'Projeto de Lei 0987/2024 - Orçamento Anual', type: 'Sim', projectNumber: 'PL 0987/2024', result: 'Aprovado' },
  { id: '3', date: '05/05/2024', description: 'Emenda Constitucional 45/2024 - Segurança Pública', type: 'Não', projectNumber: 'EC 45/2024', result: 'Rejeitado' },
  { id: '4', date: '28/04/2024', description: 'Projeto de Lei 0765/2024 - Meio Ambiente', type: 'Abstenção', projectNumber: 'PL 0765/2024', result: 'Em Tramitação' },
  { id: '5', date: '20/04/2024', description: 'Medida Provisória 1234/2024 - Auxílio Brasil', type: 'Sim', projectNumber: 'MP 1234/2024', result: 'Aprovado' },
  { id: '6', date: '15/04/2024', description: 'Projeto de Lei 0554/2024 - Educação', type: 'Ausência', projectNumber: 'PL 0554/2024', result: 'Rejeitado' },
];

export interface ElectionData {
  year: number;
  votes: number;
  votesPercentage: number;
  seatWon: boolean;
  cargo: string;
}

export const electionHistory: ElectionData[] = [
  { year: 2022, votes: 58021580, votesPercentage: 50.9, seatWon: true, cargo: 'Presidente' },
  { year: 2018, votes: 57797818, votesPercentage: 55.13, seatWon: true, cargo: 'Presidente' },
  { year: 2006, votes: 47516983, votesPercentage: 48.61, seatWon: true, cargo: 'Presidente' },
  { year: 2002, votes: 39535934, votesPercentage: 46.44, seatWon: true, cargo: 'Presidente' },
  { year: 1989, votes: 31170340, votesPercentage: 47.62, seatWon: false, cargo: 'Presidente' },
];

export interface ExpenseData {
  year: number;
  category: string;
  amount: number;
}

export const campaignExpenses: ExpenseData[] = [
  { year: 2022, category: 'Marketing Digital', amount: 185000000 },
  { year: 2022, category: 'Combustível e Locomoção', amount: 45000000 },
  { year: 2022, category: 'Material de Campanha', amount: 38000000 },
  { year: 2022, category: 'Eventos e Comícios', amount: 52000000 },
  { year: 2022, category: 'Consultoria e Assessoria', amount: 28000000 },
  { year: 2018, category: 'Marketing Digital', amount: 95000000 },
  { year: 2018, category: 'TV e Rádio', amount: 120000000 },
  { year: 2018, category: 'Eventos e Comícios', amount: 35000000 },
  { year: 2018, category: 'Combustível e Locomoção', amount: 28000000 },
];