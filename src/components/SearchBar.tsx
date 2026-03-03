import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchDeputiesByName, Deputy } from '../services/api';
import styles from '../styles/SearchBar.module.css';

export function SearchBar() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Deputy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDeputies = async () => {
      if (term.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const deputados = await fetchDeputiesByName(term);
        setResults(deputados);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching deputados:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchDeputies, 300);
    return () => clearTimeout(debounce);
  }, [term]);

  const handleClear = () => {
    setTerm('');
    setResults([]);
    setShowResults(false);
  };

  const handleDeputyClick = (deputyId: string) => {
    setShowResults(false);
    window.location.href = `/politico/${deputyId}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleDeputyClick(results[0].id);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <div className={styles.searchIcon}>
          <Search className={styles.icon} />
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="Buscar político, partido ou despesa..."
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        {term && (
          <button className={styles.clearButton} onClick={handleClear}>
            <X className={styles.clearIcon} />
          </button>
        )}
      </div>

      {showResults && (
        <div className={styles.results}>
          {loading ? (
            <div className={styles.loading}>Buscando...</div>
          ) : results.length > 0 ? (
            results.map((deputy) => (
              <div
                key={deputy.id}
                className={styles.resultItem}
                onClick={() => handleDeputyClick(deputy.id)}
              >
                {deputy.photo && (
                  <img src={deputy.photo} alt={deputy.name} className={styles.photo} />
                )}
                <div className={styles.info}>
                  <div className={styles.name}>{deputy.name}</div>
                  <div className={styles.details}>
                    <span className={styles.role}>{deputy.role}</span>
                    {deputy.party && <span className={styles.party}> • {deputy.party}</span>}
                    <span className={styles.state}> • {deputy.state}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>Nenhum deputado encontrado</div>
          )}
        </div>
      )}
    </div>);
}
