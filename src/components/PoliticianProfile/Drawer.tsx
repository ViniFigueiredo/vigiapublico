import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Drawer.module.css';

export interface DrawerProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Drawer({ title, icon, children, defaultOpen = false }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
      >
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {icon}
          </div>
          <span className={styles.title}>{title}</span>
        </div>
        {isOpen ? <ChevronUp className={styles.chevron} /> : <ChevronDown className={styles.chevron} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.contentWrapper}
          >
            <div className={styles.content}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}