import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Party, PoliticianMember } from '../services/api';
import { LoadingSpinner } from '../utils/LoadingSpinner';
import styles from '../styles/PartyMembersModal.module.css';

interface PartyMembersModalProps {
  party: Party;
  members: PoliticianMember[];
  loading: boolean;
  onClose: () => void;
  onMemberClick: (memberId: string) => void;
}

export function PartyMembersModal({ party, members, loading, onClose, onMemberClick }: PartyMembersModalProps) {
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
          <div className={styles.partyInfo}>
            <div
              className={styles.partyLogo}
              style={{ backgroundColor: party.color }}
            >
              {party.logo ? (
                <img src={party.logo} alt={party.abbr} className="w-full h-full rounded-full object-contain bg-white" />
              ) : (
                party.abbr.charAt(0)
              )}
            </div>
            <div className={styles.partyDetails}>
              <h2>Membros do {party.abbr}</h2>
              <p>{party.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <LoadingSpinner />
          ) : members.length === 0 ? (
            <p className={styles.empty}>Nenhum membro encontrado</p>
          ) : (
            <div className={styles.memberList}>
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={styles.member}
                  onClick={() => onMemberClick(member.id)}
                >
                  <img
                    src={member.photo}
                    alt={member.name}
                    className={styles.memberPhoto}
                  />
                  <div className={styles.memberInfo}>
                    <p className={styles.memberName}>{member.name}</p>
                    <p className={styles.memberRole}>{member.role}</p>
                  </div>
                  <span className={styles.memberState}>
                    {member.state}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
