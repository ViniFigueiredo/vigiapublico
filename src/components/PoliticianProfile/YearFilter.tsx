import styles from './YearFilter.module.css';

export interface YearFilterProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  years: number[];
}

export function YearFilter({ selectedYear, onYearChange, years }: YearFilterProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filtrar por ano</h3>
      </div>
      <div className={styles.yearsWrapper}>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={
              selectedYear === year
                ? styles.yearBtnActive
                : styles.yearBtnInactive
            }
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}