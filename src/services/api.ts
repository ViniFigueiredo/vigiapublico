export interface Party {
  id: string;
  name: string;
  abbr: string;
  spent: number;
  color: string;
  variation: number;
  members: number;
  logo?: string;
}

interface ApiParty {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
}

const FETCH_OPTIONS: RequestInit = {
  mode: 'cors',
  headers: { 'Accept': 'application/json' },
};

async function fetchWithRetry(url: string, retries = 3, options?: { signal?: AbortSignal }): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...FETCH_OPTIONS,
        signal: options?.signal
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      lastError = error;
    }
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 300 * attempt));
    }
  }
  throw lastError;
}

export async function fetchParties(
  legislature = 57,
  options?: { signal?: AbortSignal }
): Promise<Party[]> {
  const url =
    legislature === 57
      ? `/api/api/v2/partidos?ordem=ASC&ordenarPor=sigla&itens=100`
      : `/api/api/v2/partidos?idLegislatura=${legislature}&itens=100`;

  const response = await fetchWithRetry(url, 3, options);
  const data = await response.json();

  if (!data.dados) return [];

  const parties = await Promise.all(
    data.dados.map(async (party: ApiParty) => {
      const detailsResponse = await fetchWithRetry(
        `/api/api/v2/partidos/${party.id}`,
        3,
        options
      );
      const detailsData = await detailsResponse.json();

      return {
        id: String(party.id),
        abbr: party.sigla,
        name: party.nome,
        logo: detailsData?.dados?.urlLogo || null,
      };
    })
  );

  return parties;
}

export interface PoliticianMember {
  id: string;
  name: string;
  photo: string;
  state: string;
  role: string;
  email?: string;
}

export interface Deputy {
  id: string;
  name: string;
  photo: string;
  state: string;
  role: string;
  party?: string;
}

export interface Legislature {
  id: number;
  dateFrom: string;
  dateTo: string;
}

export async function fetchLegislatures(): Promise<Legislature[]> {
  try {
    const response = await fetchWithRetry(
      '/api/api/v2/legislaturas?itens=100',
      3
    );
    
    const data = await response.json();
    
    if (!data.dados) return [];
    
    return data.dados.map((l: any) => ({
      id: l.id,
      dateFrom: l.dataInicio,
      dateTo: l.dataFim,
    })).sort((a: Legislature, b: Legislature) => b.id - a.id);
  } catch (error) {
    console.error('Error fetching legislatures:', error);
    return [];
  }
}

export async function fetchDeputiesByName(
  name: string,
  options?: { signal?: AbortSignal }
): Promise<Deputy[]> {
  try {
    if (!name || name.length < 2) return [];

    console.log('Buscando deputado:', name);

    const response = await fetch('/dados/deputados.csv', options);
    const conteudo = await response.text();

    const linhas = conteudo
      .split('\n')
      .map(l => l.trim())
      .filter(l => l !== '');

    if (linhas.length <= 1) return [];

    const cabecalho = linhas[0]
      .replace(/"/g, '')
      .split(';');

    const dados = linhas.slice(1).map(linha => {
      const valores = linha
        .replace(/"/g, '')
        .split(';');

      const obj: any = {};

      cabecalho.forEach((col, i) => {
        obj[col] = valores[i] ?? '';
      });

      return obj;
    });

    console.log('[fetchDeputiesByName] Total de registros processados:', dados.length);

    const filtrado = dados.filter(dep =>
      dep.nome?.toLowerCase().includes(name.toLowerCase())
    );

    return filtrado.map(d => {
      const uri = d.uri || '';
      const idFromUri = uri.split('/').pop() || '';

      return {
        id: idFromUri || d.id || d.idDeputado || '',
        name: d.nome || d.nomeDeputado || '',
        photo: d.urlFoto || d.foto || '',
        state: d.siglaUf || d.uf || '',
        role: 'Deputado Federal',
        party: d.siglaPartido || d.partido || '',
      };
    });

  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error fetching deputados by name:', error);
    }
    return [];
  }
}

export async function fetchAllDeputies(legislature?: number, options?: { signal?: AbortSignal }): Promise<Deputy[]> {
  const legislatureParam = legislature ? `idLegislatura=${legislature}` : 'idLegislatura=57';
  const allDeputies: Deputy[] = [];
  const seen = new Set<string>();
  let nextUrl: string | null =
    `/api/api/v2/deputados?${legislatureParam}&itens=100&ordem=ASC&ordenarPor=nome`;

  while (nextUrl) {
    try {
      const response: Response = await fetchWithRetry(nextUrl, 3, options);

      const data: { dados: any[]; links?: { rel: string; href: string }[] } = await response.json();

      if (!data.dados) break;

      for (const d of data.dados) {
        const id = String(d.id);
        if (!seen.has(id)) {
          seen.add(id);
          allDeputies.push({
            id,
            name: d.nome,
            photo: d.urlFoto || '',
            state: d.siglaUf,
            role: 'Deputado Federal',
            party: d.siglaPartido,
          });
        }
      }

      const nextLink: { rel: string; href: string } | undefined =
        data.links?.find((l) => l.rel === 'next');
      nextUrl = nextLink?.href ?? null;
      
      if (allDeputies.length > 2000) break;
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      console.error('Error fetching deputies page:', error);
      break;
    }
  }

  return allDeputies;
}

export async function fetchPartyMembers(partyAbbr: string, legislature = 57, options?: { signal?: AbortSignal }): Promise<PoliticianMember[]> {
  try {
    const response = await fetchWithRetry(
      `/api/api/v2/deputados?idLegislatura=${legislature}&siglaPartido=${partyAbbr}&itens=100`,
      3,
      options
    );

    const data = await response.json();
    
    if (!data.dados) return [];
    
    return data.dados.map((d: any) => ({
      id: String(d.id),
      name: d.nome,
      photo: d.urlFoto || '',
      state: d.siglaUf,
      role: 'Deputado Federal',
      email: d.email,
    }));
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error fetching party members:', error);
    }
    return [];
  }
}

export interface DeputyDetail {
  id: string;
  name: string;
  photo: string;
  party: string;
  partyColor: string;
  state: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  education: string;
  email?: string;
  phone?: string;
  office?: string;
  condition: string;
  situation: string;
  socialMedia: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

function mapDeputyDetail(deputy: any): DeputyDetail {
  const status = deputy.ultimoStatus;
  return {
    id: String(deputy.id),
    name: status?.nomeEleitoral || deputy.nomeCivil || deputy.nome || '',
    photo: status?.urlFoto || deputy.urlFoto || '',
    party: status?.siglaPartido || deputy.siglaPartido || '',
    partyColor: '#1B2A4A',
    state: status?.siglaUf || deputy.siglaUf || '',
    birthDate: deputy.dataNascimento ? new Date(deputy.dataNascimento).toLocaleDateString('pt-BR') : '',
    birthPlace: deputy.municipioNascimento ? `${deputy.municipioNascimento}, ${deputy.ufNascimento}` : '',
    gender: deputy.sexo === 'M' ? 'Masculino' : deputy.sexo === 'F' ? 'Feminino' : '',
    education: deputy.escolaridade || '',
    email: status?.gabinete?.email || deputy.email,
    phone: status?.gabinete?.telefone,
    office: status?.gabinete ? `Gabinete ${status.gabinete.nome}, ${status.gabinete.predio}º andar` : '',
    condition: status?.condicaoEleitoral || '',
    situation: status?.situacao || '',
    socialMedia: {
      twitter: deputy.redeSocial?.find((s: string) => s.includes('twitter'))?.replace('https://twitter.com/', ''),
      instagram: deputy.redeSocial?.find((s: string) => s.includes('instagram'))?.replace('https://instagram.com/', ''),
      facebook: deputy.redeSocial?.find((s: string) => s.includes('facebook'))?.replace('https://facebook.com/', ''),
      youtube: deputy.redeSocial?.find((s: string) => s.includes('youtube'))?.replace('https://youtube.com/', '').replace('channel/', 'c/'),
    },
  };
}

export async function fetchDeputyById(id: string): Promise<DeputyDetail | null> {
  // Tenta o endpoint detalhado primeiro
  try {
    const response = await fetchWithRetry(
      `/api/api/v2/deputados/${id}`
    );
    const data = await response.json();
    if (data.dados) return mapDeputyDetail(data.dados);
  } catch {
  }

  try {
    const response = await fetchWithRetry(
      `/api/api/v2/deputados?id=${id}&itens=1`
    );
    const data = await response.json();
    if (data.dados?.length) return mapDeputyDetail(data.dados[0]);
  } catch (error) {
    console.error('Error fetching deputy:', error);
  }

  return null;
}

export async function fetchDeputyHistory(id: string): Promise<any[]> {
  try {
    const response = await fetchWithRetry(
      `/api/api/v2/deputados/${id}/historico`
    );
    const data = await response.json();
    return data.dados || [];
  } catch (error) {
    console.error('Error fetching deputy history:', error);
    return [];
  }
}

export interface DeputyExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  supplier: string;
  documentUrl?: string;
}

interface HistoricoItem {
  idLegislatura: number;
}

interface Legislatura {
  idLegislatura: number;
  dataInicio: string;
  dataFim: string;
}

export async function fetchDeputyYears(
  deputyId: number
): Promise<number[]> {
  try {
    const response = await fetch(
      `/api/api/v2/deputados/${deputyId}/historico`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const historico: { dados: HistoricoItem[] } =
      await response.json();

    if (!historico.dados) return [];

    const legislaturaIds = [
      ...new Set(historico.dados.map(item => item.idLegislatura))
    ];

    const legislaturasResponse = await fetch(
      "/dados/legislaturas.json"
    );

    const legislaturasData: { dados: Legislatura[] } =
      await legislaturasResponse.json();

    const legislaturasDoDeputado = legislaturasData.dados.filter(
      leg => legislaturaIds.includes(leg.idLegislatura)
    );

    const allYears = legislaturasDoDeputado.flatMap(leg => {
      const startYear = new Date(leg.dataInicio).getFullYear();
      const endYear = new Date(leg.dataFim).getFullYear();

      return Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
    });

    return [...new Set(allYears)].sort((a, b) => a - b);

  } catch (error) {
    console.error("Erro ao buscar anos do deputado:", error);
    return [];
  }
}

export async function fetchDeputyExpenses(deputyId: string, year?: number, month?: number): Promise<DeputyExpense[]> {
  try {
    let url = `/api/api/v2/deputados/${deputyId}/despesas?itens=100&ordem=desc&ordenarPor=dataDocumento`;
    if (year) url += `&ano=${year}`;
    if (month) url += `&mes=${month}`;

    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.dados) return [];

    return data.dados.map((d: any, index: number) => ({
      id: `${deputyId}-${index}-${d.codDocumento || d.numDocumento}`,
      date: d.dataDocumento ? new Date(d.dataDocumento).toLocaleDateString('pt-BR') : `${d.mes}/${d.ano}`,
      description: d.tipoDespesa,
      category: d.tipoDespesa,
      amount: d.valorLiquido || d.valorDocumento,
      supplier: d.nomeFornecedor,
      documentUrl: d.urlDocumento
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export interface Speech {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  urlVideo: string;
  urlAudio: string;
}

export interface BiographyItem {
  title: string;
  content: string;
}

export async function fetchDeputyBiography(deputyId: string): Promise<BiographyItem[]> {
  try {

    const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.camara.leg.br/deputados/${deputyId}/biografia`)}`);
    if (!response.ok) return [];
    
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const items: BiographyItem[] = [];
    const container = doc.querySelector('.biografia-detalhes-deputado');
    
    if (!container) return [];

    let currentTitle = 'Informações Gerais'; 
    
    Array.from(container.children).forEach(el => {
      const tag = el.tagName.toLowerCase();
      
      if (tag === 'strong') {
        currentTitle = el.textContent?.trim().replace(/:$/, '') || '';
      } else if (tag === 'p') {
        const textContent = el.textContent?.trim();
  
        if (textContent) {
          items.push({
            title: currentTitle,
            content: el.innerHTML.trim()
          });
          currentTitle = 'Outras Informações'; 
        }
      }
    });
    
    const mergedItems = items.reduce((acc: BiographyItem[], current) => {
      const existing = acc.find(item => item.title === current.title);
      if (existing) {
        existing.content += `<br /><br />${current.content}`;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

    return mergedItems;
  } catch (error) {
    console.error('Error fetching biography:', error);
    return [];
  }
}

