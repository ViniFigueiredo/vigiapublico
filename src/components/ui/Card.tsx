import styles from '../../styles/Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={noPadding ? styles.contentNoPadding : styles.content}>{children}</div>
    </div>);
}
