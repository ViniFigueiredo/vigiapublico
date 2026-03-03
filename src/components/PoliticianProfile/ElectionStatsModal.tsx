import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { X, Vote, TrendingUp, DollarSign, BarChart3 as BarChartIcon, PieChart } from 'lucide-react';
import { electionHistory, campaignExpenses } from './mockData';
import styles from './ElectionStatsModal.module.css';

export function ElectionStatsModal({ onClose }: { onClose: () => void }) {
  const [selectedElection, setSelectedElection] = useState<number | 'all'>('all');
  
  const filteredExpenses = selectedElection === 'all' 
    ? campaignExpenses 
    : campaignExpenses.filter(e => e.year === selectedElection);

  const totalVotes = selectedElection === 'all'
    ? electionHistory.reduce((sum, e) => sum + e.votes, 0)
    : electionHistory.find(e => e.year === selectedElection)?.votes || 0;
    
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const wins = selectedElection === 'all'
    ? electionHistory.filter(e => e.seatWon).length
    : (electionHistory.find(e => e.year === selectedElection)?.seatWon ? 1 : 0);

  const filteredElections = selectedElection === 'all'
    ? electionHistory
    : electionHistory.filter(e => e.year === selectedElection);

  const votesByYear = filteredElections.map(e => ({
    year: e.year,
    votes: e.votes,
  }));

  const expensesByYear = filteredExpenses.reduce((acc, curr) => {
    const existing = acc.find(e => e.year === curr.year);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ year: curr.year, amount: curr.amount });
    }
    return acc;
  }, [] as { year: number; amount: number }[]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Estatísticas Eleitorais</h2>
            <p className={styles.subtitle}>Votos obtidos e gastos de campanha</p>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.filterBox}>
            <label className={styles.filterLabel}>Filtrar por eleição</label>
            <div className={styles.filterWrapper}>
              <button
                onClick={() => setSelectedElection('all')}
                className={selectedElection === 'all' ? styles.btnActive : styles.btnInactive}
              >
                Todas
              </button>
              {electionHistory.map((election) => (
                <button
                  key={election.year}
                  onClick={() => setSelectedElection(election.year)}
                  className={selectedElection === election.year ? styles.btnActive : styles.btnInactive}
                >
                  {election.year} {election.seatWon && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.statsGrid}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={styles.statCard}>
                <div className={styles.statFlex}>
                  <div>
                    <p className={styles.statLabel}>Total de Votos</p>
                    <h3 className={styles.statValue}>{totalVotes.toLocaleString('pt-BR')}</h3>
                  </div>
                  <div className={styles.iconGreen}>
                    <Vote className={styles.icon} />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={styles.statCard}>
                <div className={styles.statFlex}>
                  <div>
                    <p className={styles.statLabel}>Gastos de Campanha</p>
                    <h3 className={styles.statValue}>{formatCurrency(totalExpenses)}</h3>
                  </div>
                  <div className={styles.iconRed}>
                    <DollarSign className={styles.icon} />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={styles.statCard}>
                <div className={styles.statFlex}>
                  <div>
                    <p className={styles.statLabel}>Eleições Vencidas</p>
                    <h3 className={styles.statValue}>{wins}</h3>
                  </div>
                  <div className={styles.iconBlue}>
                    <TrendingUp className={styles.icon} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className={styles.chartsGrid}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className={styles.chartHeader}>
                  <BarChartIcon className={styles.chartIcon} />
                  <h3 className={styles.chartTitle}>Votos por Ano</h3>
                </div>
                <div className={styles.chartList}>
                  {votesByYear.map((item, index) => {
                    const election = electionHistory.find(e => e.year === item.year);
                    const maxVotes = Math.max(...votesByYear.map(v => v.votes));
                    return (
                      <motion.div
                        key={item.year}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={styles.chartItem}
                      >
                        <div className={styles.chartLabelRow}>
                          <span className={styles.chartYear}>{item.year}</span>
                          <span className={styles.chartValue}>
                            {item.votes.toLocaleString('pt-BR')} votos
                            {election?.seatWon && <span className={styles.checkMark}>✓</span>}
                          </span>
                        </div>
                        <div className={styles.barBg}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.votes / maxVotes) * 100}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                            className={election?.seatWon ? styles.barFillGreen : styles.barFillGray}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className={styles.chartHeader}>
                  <PieChart className={styles.chartIcon} />
                  <h3 className={styles.chartTitle}>Gastos por Ano</h3>
                </div>
                <div className={styles.chartList}>
                  {expensesByYear.map((item, index) => {
                    const maxExpenses = Math.max(...expensesByYear.map(e => e.amount));
                    return (
                      <motion.div
                        key={item.year}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={styles.chartItem}
                      >
                        <div className={styles.chartLabelRow}>
                          <span className={styles.chartYear}>{item.year}</span>
                          <span className={styles.chartValue}>{formatCurrency(item.amount)}</span>
                        </div>
                        <div className={styles.barBg}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.amount / maxExpenses) * 100}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                            className={styles.barFillRed}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className={styles.chartHeader}>
                <DollarSign className={styles.chartIcon} />
                <h3 className={styles.chartTitle}>Detalhamento de Gastos</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeaderRow}>
                      <th className={styles.tableHeaderCell}>Ano</th>
                      <th className={styles.tableHeaderCell}>Categoria</th>
                      <th className={styles.tableHeaderCellRight}>Valor</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {campaignExpenses.map((expense, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className={styles.tableRow}
                      >
                        <td className={styles.tableCellBold}>{expense.year}</td>
                        <td className={styles.tableCell}>{expense.category}</td>
                        <td className={styles.tableCellRightBold}>{formatCurrency(expense.amount)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}