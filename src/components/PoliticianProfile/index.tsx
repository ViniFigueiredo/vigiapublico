import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../ui/Card';
import { SearchBar } from '../SearchBar';
import { fetchDeputyById, fetchDeputyExpenses, fetchDeputyBiography, fetchDeputyYears, DeputyDetail, DeputyExpense, BiographyItem } from '../../services/api';
import { LoadingPage } from '../../utils/LoadingSpinner';
import { 
  MapPin, Calendar, PartyPopper, Twitter, Instagram, Facebook, Youtube, 
  DollarSign, ArrowLeft, BookOpen, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

import { YearFilter } from './YearFilter';
import { Drawer } from './Drawer';
import styles from './PoliticianProfile.module.css';

export function PoliticianProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [deputy, setDeputy] = useState<DeputyDetail | null>(null);
  const [expenses, setExpenses] = useState<DeputyExpense[]>([]);
  const [biography, setBiography] = useState<BiographyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setLoading(true);
    setDeputy(null);

    Promise.all([
      fetchDeputyById(id),
      fetchDeputyYears(Number(id))
    ])
    .then(([deputyData, deputyYears]) => {
      if (stale) return;
      setDeputy(deputyData);
      
      const currentYear = new Date().getFullYear();
      const filteredYears = (deputyYears || []).filter(year => year <= currentYear);
      const sortedYears = filteredYears.sort((a, b) => b - a);
      
      setYears(sortedYears);
      if (sortedYears.length > 0) {
        setSelectedYear(sortedYears[0]);
      } else {
        setYears([]);
        setSelectedYear(null);
      }
    })
    .catch((err) => { 
      console.error('Error in Promise.all:', err);
      if (!stale) setDeputy(null); 
    })
    .finally(() => { if (!stale) setLoading(false); });

    return () => { stale = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setLoadingBio(true);
    fetchDeputyBiography(id)
      .then(data => { if (!stale) setBiography(data); })
      .catch(() => { if (!stale) setBiography([]); })
      .finally(() => { if (!stale) setLoadingBio(false); });
    return () => { stale = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !deputy || !selectedYear) return;
    let stale = false;
    setLoadingExpenses(true);
    fetchDeputyExpenses(id, selectedYear)
      .then(data => { if (!stale) setExpenses(data); })
      .catch(() => { if (!stale) setExpenses([]); })
      .finally(() => { if (!stale) setLoadingExpenses(false); });
    return () => { stale = true; };
  }, [id, selectedYear, deputy]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!deputy) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundText}>
          <h2 className={styles.notFoundTitle}>Deputado não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className={styles.notFoundBtn}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <SearchBar />
        
        <button
          onClick={() => navigate('/')}
          className={styles.backBtn}
        >
          <ArrowLeft className={styles.backIcon} />
          <span className={styles.backText}>Voltar ao Dashboard</span>
        </button>

        <div className={styles.gridContainer}>
          <div className={styles.leftColumn}>
            <Card className={styles.stickyCard}>
              <div className="text-center">
                <img
                  src={deputy.photo}
                  alt={deputy.name}
                  className={styles.profileImage}
                />
                <h1 className={styles.profileName}>{deputy.name}</h1>
                <div className={styles.partyBadgeWrapper}>
                  <span
                    className={styles.partyBadge}
                    style={{ backgroundColor: deputy.partyColor }}
                  >
                    {deputy.party}
                  </span>
                </div>
              </div>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoLabel}>Estado</p>
                    <p className={styles.infoValue}>{deputy.state}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <PartyPopper className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoLabel}>Partido</p>
                    <p className={styles.infoValue}>{deputy.party}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoLabel}>Nascimento</p>
                    <p className={styles.infoValue}>{deputy.birthDate}</p>
                  </div>
                </div>

                {deputy.email && (
                  <div className={styles.infoItem}>
                    <PartyPopper className={styles.infoIcon} />
                    <div>
                      <p className={styles.infoLabel}>Email</p>
                      <p className={styles.infoValue}>{deputy.email}</p>
                    </div>
                  </div>
                )}

                {deputy.phone && (
                  <div className={styles.infoItem}>
                    <PartyPopper className={styles.infoIcon} />
                    <div>
                      <p className={styles.infoLabel}>Telefone</p>
                      <p className={styles.infoValue}>{deputy.phone}</p>
                    </div>
                  </div>
                )}

                {deputy.office && (
                  <div className={styles.infoItem}>
                    <PartyPopper className={styles.infoIcon} />
                    <div>
                      <p className={styles.infoLabel}>Gabinete</p>
                      <p className={styles.infoValue}>{deputy.office}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.socialWrapper}>
                <p className={styles.socialTitle}>Redes Sociais</p>
                <div className={styles.socialIcons}>
                  {deputy.socialMedia.twitter && (
                    <a href={`https://twitter.com/${deputy.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      <Twitter className={styles.socialIcon} />
                    </a>
                  )}
                  {deputy.socialMedia.instagram && (
                    <a href={`https://instagram.com/${deputy.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      <Instagram className={styles.socialIcon} />
                    </a>
                  )}
                  {deputy.socialMedia.facebook && (
                    <a href={`https://facebook.com/${deputy.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      <Facebook className={styles.socialIcon} />
                    </a>
                  )}
                  {deputy.socialMedia.youtube && (
                    <a href={`https://youtube.com/${deputy.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      <Youtube className={styles.socialIcon} />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.filterContainer}>
              {selectedYear && (
                <YearFilter
                  selectedYear={selectedYear}
                  onYearChange={(y) => setSelectedYear(y)}
                  years={years}
                />
              )}
            </div>



            <Drawer title="Gastos" icon={<DollarSign className="w-5 h-5" />}>
              <div className={styles.listContainer}>
                {loadingExpenses ? (
                  <div className={styles.loaderWrapper}>
                    <div className={styles.loader}></div>
                  </div>
                ) : expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div key={expense.id} className={styles.listItem}>
                      <div className={styles.expenseItemContent}>
                        <div className={styles.expenseHeader}>
                          <p className={styles.listItemTitle}>{expense.description}</p>
                          {expense.documentUrl && (
                            <a 
                              href={expense.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.expenseLink}
                              title="Ver Documento"
                            >
                              <ExternalLink className={styles.expenseLinkIcon} />
                            </a>
                          )}
                        </div>
                        <p className={styles.listItemSubtitle}>{expense.supplier} • {expense.date}</p>
                      </div>
                      <div className={styles.expenseRight}>
                        <p className={styles.expenseAmount}>{formatCurrency(expense.amount)}</p>
                        <span className={styles.expenseCategory}>{expense.category}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    Nenhuma despesa encontrada para o ano de {selectedYear}.
                  </div>
                )}
              </div>
            </Drawer>

                        <Drawer title="Biografia" icon={<BookOpen className="w-5 h-5" />}>
              <div className={styles.bioDrawer}>
                {loadingBio ? (
                  <div className={styles.loaderWrapper}>
                    <div className={styles.loader}></div>
                  </div>
                ) : biography.length > 0 ? (
                  biography.map((item, index) => (
                    <div key={index} className={styles.bioCard}>
                      <h4 className={styles.bioTitle}>{item.title}</h4>
                      <div 
                        className={styles.bioContent} 
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    Nenhuma informação biográfica encontrada.
                  </div>
                )}
              </div>
            </Drawer>
          </div>
        </div>
      </main>
    </div>
  );
}