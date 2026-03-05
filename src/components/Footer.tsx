import { FileText } from 'lucide-react';
import styles from '../styles/Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        <FileText className={styles.icon} />

      </p>
      <p className={styles.copyright}>

      </p>
    </footer>
  );
}
