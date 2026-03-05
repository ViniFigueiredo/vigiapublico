import { motion } from 'framer-motion';
import { Party } from '../services/api';
import { Card } from './ui/Card';
import styles from '../styles/PartyRankingTable.module.css';

interface PartyRankingTableProps {
  data: Party[];
  onViewPartyMembers?: (party: Party) => void;
  onToggleShowAll?: () => void;
  showAll?: boolean;
}

export function PartyRankingTable({ data, onViewPartyMembers, onToggleShowAll, showAll }: PartyRankingTableProps) {
  return (
    <Card noPadding className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-navy-900">
            Partidos Políticos
          </h2>
          <p className="text-sm text-slate-500">
            Lista de todos os partidos políticos do Brasil
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.headerCell}>#</th>
              <th className={styles.headerCellParty}>Partido</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.map((party, index) =>
            <motion.tr
              key={party.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={styles.row}
            >
                <td className={styles.cell}>
                  {index + 1}
                </td>
                <td className={styles.cellParty}>
                  <div className={styles.partyRow} onClick={() => onViewPartyMembers?.(party)}>
                    {party.logo && (
                        <img
                          src={party.logo}
                          className={styles.partyLogo}
                        />
                      )}
                    <div>
                      <span className={styles.partyName}>{party.abbr}</span>
                      <span className={styles.partyFullName}>{party.name}</span>
                    </div>
                  </div>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <button onClick={onToggleShowAll} className={styles.toggleButton}>
            {showAll ? 'Ver menos' : 'Ver todos os partidos'}
          </button>
        </div>
      </div>
    </Card>);
}
