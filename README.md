# Vigia Público

Aplicação web para visualização de dados públicos da Câmara dos Deputados, com foco em consulta de partidos, deputados e despesas parlamentares.

## Propósito do projeto

O objetivo do **Vigia Público** é facilitar o acesso a informações parlamentares em uma interface simples e navegável, permitindo:

- acompanhar deputados por legislatura;
- consultar membros de partidos;
- abrir o perfil detalhado de um parlamentar;
- visualizar despesas por ano;
- consultar biografia pública do deputado.

## Funcionalidades principais

### Dashboard (`/`)

- Alternância entre visão de **Partidos Políticos** e **Deputados**.
- Filtro por legislatura para ambas as visões.
- Na visão de deputados, filtros adicionais:
	- estado (UF);
	- ordenação alfabética (A-Z / Z-A).
- Busca textual com autocomplete para localizar deputados.
- Modal com membros de um partido ao clicar em uma linha da tabela de partidos.

### Perfil do político (`/politico/:id`)

- Dados cadastrais e institucionais do deputado.
- Links para redes sociais, quando disponíveis.
- Filtro por ano de atividade parlamentar.
- Lista de despesas com fornecedor, data, categoria, valor e link para documento.
- Bloco de biografia (conteúdo público extraído da página da Câmara).

## Tecnologias utilizadas

### Front-end

- `React 18` + `TypeScript`
- `Vite 5` (build e servidor de desenvolvimento)
- `React Router` (roteamento)
- `Framer Motion` (animações)
- `Lucide React` (ícones)
- `Tailwind CSS` + `CSS Modules` (estilização)

### Qualidade e tooling

- `ESLint`
- `PostCSS` + `Autoprefixer`

### Dados

- API pública da Câmara dos Deputados (via proxy local em desenvolvimento)
- Arquivos locais em `public/dados` para apoio de busca e legislaturas

## Requisitos

- `Node.js` 18+ (recomendado)
- `npm` 9+

## Instalação e execução

1. Clone o repositório:

```bash
git clone https://github.com/ViniFigueiredo/vigiapublico.git
cd vigiapublico
```

2. Instale as dependências:

```bash
npm install
```

3. Rode em modo desenvolvimento:

```bash
npm run dev
```

4. Acesse no navegador o endereço informado pelo Vite (normalmente `http://localhost:5173`).

## Scripts disponíveis

- `npm run dev`: inicia servidor de desenvolvimento.
- `npm run build`: executa a aplicação via Vite (mantém suporte ao proxy).
- `npm run preview`: sobe servidor local para visualizar build.
- `npm run lint`: executa análise estática com ESLint.

## Estrutura do projeto

```text
.
├─ public/
│  └─ dados/
│     ├─ deputados.csv
│     └─ legislaturas.json
├─ src/
│  ├─ components/
│  │  ├─ Dashboard.tsx
│  │  ├─ SearchBar.tsx
│  │  ├─ PartyRankingTable.tsx
│  │  ├─ DeputyRankingTable.tsx
│  │  ├─ PartyMembersModal.tsx
│  │  ├─ SummaryCards.tsx
│  │  ├─ Footer.tsx
│  │  ├─ PoliticianProfile/
│  │  │  ├─ index.tsx
│  │  │  ├─ Drawer.tsx
│  │  │  └─ YearFilter.tsx
│  │  └─ ui/
│  │     └─ Card.tsx
│  ├─ services/
│  │  └─ api.ts
│  ├─ styles/
│  ├─ utils/
│  │  ├─ formatters.ts
│  │  └─ LoadingSpinner.tsx
│  ├─ App.tsx
│  └─ main.tsx
├─ vite.config.ts
├─ tailwind.config.js
└─ package.json
```

## Arquitetura e funcionamento

### Roteamento

- `/` → `Dashboard`
- `/politico/:id` → `PoliticianProfile`

### Camada de dados (`src/services/api.ts`)

A aplicação centraliza as chamadas HTTP em uma camada de serviço com funções tipadas, por exemplo:

- `fetchParties`
- `fetchPartyMembers`
- `fetchAllDeputies`
- `fetchDeputyById`
- `fetchDeputyExpenses`
- `fetchDeputyBiography`
- `fetchDeputyYears`

Também existe lógica de retry (`fetchWithRetry`) para reduzir falhas intermitentes de rede.

### Fluxo de dados no Dashboard

1. Carrega legislaturas disponíveis.
2. Conforme o tipo selecionado (`partidos` ou `deputados`), busca dados correspondentes.
3. Aplica filtros de legislatura, estado e ordenação (quando aplicável).
4. Exibe tabelas e resumo com total de entidades.
5. Ao selecionar partido, abre modal com membros; ao selecionar deputado, navega para o perfil.

### Fluxo de dados no Perfil do deputado

1. Busca dados básicos do deputado e anos com atividade.
2. Define ano ativo (mais recente disponível).
3. Carrega despesas do ano selecionado.
4. Carrega biografia em paralelo.

## Integrações e fontes de dados

### API da Câmara dos Deputados

Em desenvolvimento, o Vite configura proxy para evitar problemas de CORS:

- Prefixo local: `/api`
- Destino real: `https://dadosabertos.camara.leg.br`
- Reescrita: remove `/api` antes de encaminhar

Exemplo de uso interno:

- Front-end chama: `/api/api/v2/deputados?...`
- Proxy encaminha para: `https://dadosabertos.camara.leg.br/api/v2/deputados?...`

### Dados locais (`public/dados`)

- `deputados.csv`: utilizado pela busca textual (`SearchBar`) para localizar deputados por nome.
- `legislaturas.json`: utilizado para mapear anos de atuação parlamentar no perfil.

### Biografia

As biografias são obtidas a partir da página pública da Câmara por meio do proxy externo `api.codetabs.com`, com parsing de HTML no cliente.

## Decisões técnicas relevantes

- Uso de `AbortController` para cancelar requisições em mudanças rápidas de filtro/tela.
- Ordenação e filtragem de deputados com `useMemo` para melhor performance de renderização.
- Estilo híbrido com Tailwind utilitário e CSS Modules para isolamento de escopo.

## Limitações conhecidas

- O logo dos partidos não é carregado em massa para evitar excesso de requisições e possível rate limit.
- Dependência de serviços externos para biografia pode sofrer indisponibilidade temporária.
- Alguns componentes no diretório `components/` são legados de layout e não estão no fluxo principal atual.

## Execução recomendada

Como a aplicação depende do proxy configurado no Vite durante execução local, o fluxo recomendado é iniciar o app diretamente:

```bash
npm run dev
```

ou

```bash
npm run build
```

## Próximos passos sugeridos

- Adicionar testes unitários para `services/api.ts` e componentes críticos.
- Criar tratamento visual de erro para indisponibilidade de APIs externas.
- Definir estratégia de cache para reduzir chamadas repetidas por legislatura/ano.
