import { FileText } from 'lucide-react';
import styles from '../styles/Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        <FileText className={styles.icon} />
        Dados ilustrativos para fins de demonstração técnica. Não
        representam auditoria oficial.
      </p>
      <p className={styles.copyright}>
        © 2026 Transparência Partidária Brasil. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
