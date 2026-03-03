import { Card } from './ui/Card';
import styles from '../styles/TopSpendingParties.module.css';

interface TopSpendingPersonsProps {
  type: 'deputados' | 'senadores';
}

export function TopSpendingPersons({ type }: TopSpendingPersonsProps) {
  const title = type === 'deputados' ? 'Top Gastos por Deputado' : 'Top Gastos por Senador';

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>Em breve</p>
      </div>
      <div className={styles.content}>
        <p className={styles.placeholder}>Dados em breve</p>
      </div>
    </Card>
  );
}
