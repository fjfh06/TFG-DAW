import { type ReactNode } from "react";
import styles from "./StatCard.module.css";
import { StudentAvatar } from "../StudentAvatar/StudentAvatar";
import { useNavigate } from "react-router-dom";

export interface StudentListItem {
  id: number;
  nombre: string;
  apellidos: string;
  foto?: string;
  meses_impagados?: { mes: number; anio: number }[];
}

interface StatCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  theme?: 'danger' | 'warning' | 'success' | 'info';
  students?: StudentListItem[];
  actionLink?: string;
  actionText?: string;
  emptyMessage?: string;
}

export const StatCard = ({
  title,
  count,
  icon,
  theme = 'info',
  students = [],
  actionLink,
  actionText = "Gestionar",
  emptyMessage = "Todo al día"
}: StatCardProps) => {
  const navigate = useNavigate();
  
  return (
    <div className={`${styles.card} ${styles[theme]}`}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <span className={styles.icon}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.countBadge}>{count}</div>
      </div>
      
      <div className={styles.content}>
        {count > 0 && students.length > 0 ? (
          <div className={styles.studentList}>
            {students.map(student => (
              <div 
                key={student.id} 
                className={styles.studentItem}
                onClick={actionLink ? () => navigate(actionLink) : undefined}
                style={{ cursor: actionLink ? 'pointer' : 'default' }}
              >
                <div className={styles.studentInfo}>
                  <StudentAvatar photoUrl={student.foto} name={student.nombre} lastName={student.apellidos} size="sm" />
                  <div className={styles.studentDetails}>
                    <span className={styles.studentName}>{student.nombre} {student.apellidos}</span>
                    {student.meses_impagados && student.meses_impagados.length > 0 && (
                      <div className={styles.badgeContainer}>
                        {student.meses_impagados.slice(0, 3).map((m, idx) => (
                          <span key={idx} className={styles.monthBadge}>
                            {new Date(2000, m.mes - 1).toLocaleString('es', { month: 'short' })} '{m.anio.toString().slice(-2)}
                          </span>
                        ))}
                        {student.meses_impagados.length > 3 && (
                          <span className={`${styles.monthBadge} ${styles.moreBadge}`}>
                            +{student.meses_impagados.length - 3} meses
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {actionLink && <span className={styles.actionArrow}>→</span>}
              </div>
            ))}
            {count > students.length && (
              <div 
                className={styles.moreItem}
                onClick={actionLink ? () => navigate(actionLink) : undefined}
              >
                + {count - students.length} más...
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            ✨ {emptyMessage}
          </div>
        )}
      </div>
      
      {actionLink && count > 0 && (
        <div className={styles.cardFooter}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(actionLink)}>
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
