import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchParties, Party, PoliticianMember, fetchPartyMembers,
  fetchAllDeputies, Deputy, fetchLegislatures, Legislature,
} from '../services/api';
import { SearchBar } from './SearchBar';
import { SummaryCards } from './SummaryCards';
import { PartyRankingTable } from './PartyRankingTable';
import { DeputyTable } from './DeputyRankingTable';
import { Footer } from './Footer';
import { LoadingPage } from '../utils/LoadingSpinner';
import { PartyMembersModal } from './PartyMembersModal';
import { AnimatePresence } from 'framer-motion';
import styles from '../styles/Dashboard.module.css';

interface DashboardProps {}

type FilterType = 'partidos' | 'deputados';
type SortOrder = 'asc' | 'desc';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function Dashboard({}: DashboardProps) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<FilterType>('partidos');
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParties, setLoadingParties] = useState(true);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partyMembers, setPartyMembers] = useState<PoliticianMember[]>([]);
  const [showAllParties, setShowAllParties] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [legislatures, setLegislatures] = useState<Legislature[]>([]);
  const [selectedLegislature, setSelectedLegislature] = useState<number>(57);

  const [deputies, setDeputies] = useState<Deputy[]>([]);
  const [loadingDeputies, setLoadingDeputies] = useState(false);
  const [deputyStateFilter, setDeputyStateFilter] = useState('');
  const [deputySortOrder, setDeputySortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    setParties([]);
    setDeputies([]);
  }, [selectedLegislature]);

  useEffect(() => {
    fetchLegislatures().then(data => setLegislatures(data));
  }, []);

  useEffect(() => {
    if (filterType !== 'partidos') return;

    const controller = new AbortController();
    setParties([]);
    setLoadingParties(true);
    setShowAllParties(false);

    fetchParties(selectedLegislature, { signal: controller.signal })
      .then(data => {
        setParties(data);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => {
        setLoadingParties(false);
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedLegislature, filterType]);

  useEffect(() => {
    if (filterType !== 'deputados') return;

    const controller = new AbortController();
    setDeputies([]);
    setLoadingDeputies(true);

    fetchAllDeputies(selectedLegislature, { signal: controller.signal })
      .then(data => {
        setDeputies(data);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => {
        setLoadingDeputies(false);
        setLoading(false);
      });

    return () => controller.abort();
  }, [filterType, selectedLegislature]);

  const openPartyMembers = async (party: Party) => {
    setSelectedParty(party);
    setPartyMembers([]);
    setLoadingMembers(true);
    try {
      const members = await fetchPartyMembers(party.abbr, selectedLegislature);
      setPartyMembers(members);
    } catch (error) {
      console.error('Error fetching party members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const filteredParties = parties.slice(0, showAllParties ? undefined : 5);

  const filteredAndSortedDeputies = useMemo(() => {
    let result = [...deputies];
    if (deputyStateFilter) result = result.filter(d => d.state === deputyStateFilter);
    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return deputySortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [deputies, deputyStateFilter, deputySortOrder]);

  const currentLegislature = selectedLegislature;

  const entityCount = filteredAndSortedDeputies.length;

  if (loading) return <LoadingPage />;

  const LegislatureFilters = ({
    selected,
    onSelect,
    stateFilter,
    onStateFilter,
    sortOrder,
    onSortOrder,
  }: {
    selected: number;
    onSelect: (v: number) => void;
    stateFilter: string;
    onStateFilter: (v: string) => void;
    sortOrder: SortOrder;
    onSortOrder: (v: SortOrder) => void;
  }) => (
    <div className={styles.deputiesFilters}>
      <select
        value={selected}
        onChange={e => onSelect(Number(e.target.value))}
        className={styles.legislatureSelect}
      >
        {legislatures.map(leg => (
          <option key={leg.id} value={leg.id}>
            {leg.id}ª Legislatura ({leg.dateFrom ? new Date(leg.dateFrom).getFullYear() : '?'} -{' '}
            {leg.dateTo ? new Date(leg.dateTo).getFullYear() : 'Atual'})
          </option>
        ))}
      </select>
      <select
        value={stateFilter}
        onChange={e => onStateFilter(e.target.value)}
        className={styles.stateSelect}
      >
        <option value="">Todos os estados</option>
        {BRAZILIAN_STATES.map(state => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <select
        value={sortOrder}
        onChange={e => onSortOrder(e.target.value as SortOrder)}
        className={styles.sortSelect}
      >
        <option value="asc">Ordem: A-Z</option>
        <option value="desc">Ordem: Z-A</option>
      </select>
    </div>
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>Vigia Público</h2>
          <p className={styles.heroSubtitle}>
          </p>
        </div>

        <SearchBar />

        <SummaryCards
          filterType={filterType}
          partiesCount={parties.length}
          entityCount={entityCount}
          selectedLegislature={currentLegislature}
        />

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filterType === 'partidos' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('partidos')}
          >
            Partidos Políticos
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'deputados' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('deputados')}
          >
            Deputados
          </button>
        </div>

        {filterType === 'partidos' && (
          <div className={styles.deputiesFilters}>
            <select
              value={selectedLegislature}
              onChange={e => setSelectedLegislature(Number(e.target.value))}
              className={styles.legislatureSelect}
            >
              {legislatures.map(leg => (
                <option key={leg.id} value={leg.id}>
                  {leg.id}ª Legislatura ({leg.dateFrom ? new Date(leg.dateFrom).getFullYear() : '?'} -{' '}
                  {leg.dateTo ? new Date(leg.dateTo).getFullYear() : 'Atual'})
                </option>
              ))}
            </select>
          </div>
        )}

        {filterType === 'deputados' && (
          <LegislatureFilters
            selected={selectedLegislature}
            onSelect={setSelectedLegislature}
            stateFilter={deputyStateFilter}
            onStateFilter={setDeputyStateFilter}
            sortOrder={deputySortOrder}
            onSortOrder={setDeputySortOrder}
          />
        )}

        {filterType === 'deputados' ? (
          loadingDeputies ? (
            <div className={styles.noResults}>Carregando deputados...</div>
          ) : (
            <div className={styles.tableSection}>
              <DeputyTable
                data={filteredAndSortedDeputies}
                onDeputyClick={id => navigate(`/politico/${id}`)}
              />
            </div>
          )
        ) : loadingParties ? (
          <div className={styles.noResults}>Carregando partidos...</div>
        ) : (
          <div className={styles.tableSection}>
            <PartyRankingTable
              data={filteredParties}
              onViewPartyMembers={openPartyMembers}
              onToggleShowAll={() => setShowAllParties(!showAllParties)}
              showAll={showAllParties}
            />
          </div>
        )}

        <Footer />
      </main>

      <AnimatePresence>
        {selectedParty && (
          <PartyMembersModal
            party={selectedParty}
            members={partyMembers}
            loading={loadingMembers}
            onClose={() => setSelectedParty(null)}
            onMemberClick={memberId => {
              setSelectedParty(null);
              navigate(`/politico/${memberId}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
