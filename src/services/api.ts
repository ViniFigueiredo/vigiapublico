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

interface ApiPartyDetail {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
  urlLogo: string;
}

const FETCH_OPTIONS: RequestInit = {
  mode: 'cors',
  headers: { 'Accept': 'application/json' },
};

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, FETCH_OPTIONS);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 300 * attempt));
    }
  }
  throw lastError;
}

export async function fetchParties(legislature = 57): Promise<Party[]> {
  const response = await fetchWithRetry(
    `https://dadosabertos.camara.leg.br/api/v2/partidos?idLegislatura=${legislature}&itens=100`
  );
  const data = await response.json();

  if (!data.dados) return [];

  const parties = await Promise.all(
    data.dados.map(async (party: ApiParty) => {
      try {
        const detailResponse = await fetchWithRetry(
          `https://dadosabertos.camara.leg.br/api/v2/partidos/${party.id}`
        );
        const detailData = await detailResponse.json();
        const partyDetail: ApiPartyDetail = detailData.dados;

        return {
          id: String(party.id),
          abbr: party.sigla,
          name: party.nome,
          spent: 0,
          variation: 0,
          members: 0,
          logo: partyDetail?.urlLogo || undefined,
        };
      } catch {
        return {
          id: String(party.id),
          abbr: party.sigla,
          name: party.nome,
          spent: 0,
          variation: 0,
          members: 0,
        };
      }
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
    const response = await fetch(
      'https://dadosabertos.camara.leg.br/api/v2/legislaturas?itens=100',
      {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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

export async function fetchSenators(legislature = 57): Promise<Deputy[]> {
  const url = legislature === 57
    ? 'https://legis.senado.leg.br/dadosabertos/senador/lista/atual'
    : `https://legis.senado.leg.br/dadosabertos/senador/lista/legislatura/${legislature}`;
  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    const root =
      data.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ??
      data.ListaParlamentarLegislatura?.Parlamentares?.Parlamentar;

    if (!root) return [];

    const list: any[] = Array.isArray(root) ? root : [root];
    const seen = new Set<string>();

    return list
      .map((p: any) => {
        const info = p.IdentificacaoParlamentar;
        return {
          id: String(info.CodigoParlamentar),
          name: info.NomeParlamentar,
          photo: info.UrlFotoParlamentar || '',
          state: info.UfParlamentar,
          party: info.SiglaPartidoParlamentar,
          role: 'Senador',
        } as Deputy;
      })
      .filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  } catch (error) {
    console.error('Error fetching senators:', error);
    return [];
  }
}

export async function fetchDeputiesByName(name: string): Promise<Deputy[]> {
  if (!name || name.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${encodeURIComponent(name)}&itens=10`,
      {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.dados) return [];
    
    return data.dados.map((d: any) => ({
      id: String(d.id),
      name: d.nome,
      photo: d.urlFoto || '',
      state: d.siglaUf,
      role: 'Deputado Federal',
      party: d.siglaPartido,
    }));
  } catch (error) {
    console.error('Error fetching deputados:', error);
    return [];
  }
}

export async function fetchAllDeputies(legislature?: number): Promise<Deputy[]> {
  const legislatureParam = legislature ? `idLegislatura=${legislature}` : 'idLegislatura=57';
  const allDeputies: Deputy[] = [];
  const seen = new Set<string>();
  let nextUrl: string | null =
    `https://dadosabertos.camara.leg.br/api/v2/deputados?${legislatureParam}&itens=100`;

  while (nextUrl) {
    try {
      const response: Response = await fetch(nextUrl, {
        mode: 'cors',
        headers: { 'Accept': 'application/json', 'Connection': 'keep-alive' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
    } catch (error) {
      console.error('Error fetching deputies page:', error);
      break;
    }
  }

  return allDeputies;
}

export async function fetchPartyMembers(partyAbbr: string): Promise<PoliticianMember[]> {
  try {
    const response = await fetch(
      `https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=57&siglaPartido=${partyAbbr}&itens=100`,
      { 
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
    console.error('Error fetching party members:', error);
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
      `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}`
    );
    const data = await response.json();
    if (data.dados) return mapDeputyDetail(data.dados);
  } catch {
    // endpoint detalhado bloqueado (CORS/404) — tenta fallback
  }

  // Fallback: endpoint de listagem com filtro de ID (sempre retorna CORS corretos)
  try {
    const response = await fetchWithRetry(
      `https://dadosabertos.camara.leg.br/api/v2/deputados?id=${id}&itens=1`
    );
    const data = await response.json();
    if (data.dados?.length) return mapDeputyDetail(data.dados[0]);
  } catch (error) {
    console.error('Error fetching deputy:', error);
  }

  return null;
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

export async function fetchDeputyExpenses(deputyId: string, year?: number, month?: number): Promise<DeputyExpense[]> {
  try {
    let url = `https://dadosabertos.camara.leg.br/api/v2/deputados/${deputyId}/despesas?itens=100&ordem=desc&ordenarPor=dataDocumento`;
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
    
    // Mesclar itens com o mesmo título (ex: vários <p> sob um único <strong>)
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

