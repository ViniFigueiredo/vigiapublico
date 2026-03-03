import { useNavigate } from 'react-router-dom';
import { FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from '../styles/Navbar.module.css';

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <FileText className={styles.logoIcon} />
            <span className={styles.logoText}>
              Vigia Público
            </span>
          </div>

          <div className={styles.links}>
            <a href="/" className={`${styles.link} ${styles.linkActive}`}>
              Início
            </a>
            <a href="#" className={styles.link}>
              Partidos
            </a>
            <a href="#" className={styles.link}>
              Sobre
            </a>
          </div>

          <div className={styles.mobileToggle}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.toggleButton}
            >
              {mobileMenuOpen ? <X className={styles.toggleIcon} /> : <Menu className={styles.toggleIcon} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            <a href="/" className={`${styles.mobileLink} ${styles.mobileLinkActive}`}>
              Início
            </a>
            <a href="#" className={`${styles.mobileLink} ${styles.mobileLinkInactive}`}>
              Partidos
            </a>
            <a href="#" className={`${styles.mobileLink} ${styles.mobileLinkInactive}`}>
              Sobre
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
