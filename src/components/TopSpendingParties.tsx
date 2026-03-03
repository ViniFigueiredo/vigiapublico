import { Party } from '../services/api';
import { Card } from './ui/Card';
import styles from '../styles/TopSpendingParties.module.css';

interface TopSpendingPartiesProps {
  parties: Party[];
}

export function TopSpendingParties({ parties: _parties }: TopSpendingPartiesProps) {
  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Top Gastos por Partido
        </h2>
        <p className={styles.subtitle}>Em breve</p>
      </div>

      <div className={styles.content}>
        <p className={styles.placeholder}>
          Dados em breve
        </p>
      </div>
    </Card>
  );
}
