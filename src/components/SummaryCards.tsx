import { Building2, Calendar } from 'lucide-react';
import { Card } from './ui/Card';
import styles from '../styles/SummaryCards.module.css';

type FilterType = 'partidos' | 'deputados';

interface SummaryCardsProps {
  filterType?: FilterType;
  partiesCount?: number;
  entityCount?: number;
  selectedLegislature?: number;
}

const LABEL: Record<FilterType, string> = {
  partidos: 'Partidos Políticos',
  deputados: 'Deputados Analisados',
};

const SUBTEXT: Record<FilterType, string> = {
  partidos: 'Total de partidos cadastrados',
  deputados: 'Deputados na legislatura selecionada',
};

export function SummaryCards({
  filterType = 'partidos',
  partiesCount = 0,
  entityCount = 0,
  selectedLegislature = 57,
}: SummaryCardsProps) {
  const count = filterType === 'partidos' ? partiesCount : entityCount;

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.cardContent}>
          <div>
            <p className={styles.label}>{LABEL[filterType]}</p>
            <h3 className={styles.value}>{count}</h3>
            <p className={styles.subtext}>
              {count > 0 ? SUBTEXT[filterType] : 'Carregando dados...'}
            </p>
          </div>
          <div className={styles.iconBox}>
            <Building2 className={styles.icon} />
          </div>
        </div>
      </Card>

      <Card>
        <div className={styles.cardContent}>
          <div>
            <p className={styles.label}>
              {filterType === 'partidos' ? 'Legislatura Atual' : 'Legislatura'}
            </p>
            <h3 className={styles.valueSmall}>{selectedLegislature}ª Legislatura</h3>
            <p className={styles.subtext}>
              {filterType === 'deputados'
                ? 'Dados dos deputados selecionados'
                : 'Dados dos deputados atuais'}
            </p>
          </div>
          <div className={styles.iconBox}>
            <Calendar className={styles.icon} />
          </div>
        </div>
      </Card>
    </div>
  );
}
