import { motion } from 'framer-motion';
import { Deputy } from '../services/api';
import { Card } from './ui/Card';
import styles from '../styles/DeputyRankingTable.module.css';

interface DeputyRankingTableProps {
  data: Deputy[];
  onDeputyClick?: (deputyId: string) => void;
  title?: string;
  subtitle?: string;
}

export function DeputyTable({ data, onDeputyClick, title = 'Deputados Federais', subtitle = 'Lista de todos os deputados federais do Brasil' }: DeputyRankingTableProps) {
  return (
    <Card noPadding className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-navy-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.headerCellDeputy}>Deputado</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.map((deputy, index) =>
            <motion.tr
              key={deputy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={styles.row}
            >
                <td className={styles.cell}>
                  {index + 1}
                </td>
                <td className={styles.cellDeputy}>
                  <div className={styles.deputyRow} onClick={() => onDeputyClick?.(deputy.id)}>
                    {deputy.photo ? (
                      <img src={deputy.photo} alt={deputy.name} className={styles.deputyPhoto} />
                    ) : (
                      <span className={styles.deputyInitial}>
                        {deputy.name.charAt(0)}
                      </span>
                    )}
                    <div>
                      <span className={styles.deputyName}>{deputy.name}</span>
                      <span className={styles.deputyDetails}>{deputy.party} - {deputy.state}</span>
                    </div>
                  </div>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>);
}
