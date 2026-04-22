import type { Evento } from "../../types";
import styles from "./EventCard.module.css";
import React from "react";

interface EventCardProps {
  evento: Evento;
  onEdit: (evento: Evento) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const formatDateTime = (iso: string) => {
  return new Date(iso).toLocaleString("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getDay = (iso: string) => new Date(iso).getDate();
const getMonth = (iso: string) => new Date(iso).toLocaleString("es-ES", { month: "short" }).toUpperCase();

export const EventCard: React.FC<EventCardProps> = ({ evento, onEdit, onDelete, onView }) => {
  const isFree = Number(evento.precio_inscripcion) === 0;

  return (
    <div className={styles.card}>
      <div className={`${styles.header} ${styles[evento.tipo] || styles.defaultHeader}`}>
        <div className={styles.dateBadge}>
          <span className={styles.dateMonth}>{getMonth(evento.fecha_inicio)}</span>
          <span className={styles.dateDay}>{getDay(evento.fecha_inicio)}</span>
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.badge}>{evento.estado}</span>
          <h3 className={styles.title}>{evento.nombre}</h3>
          <p className={styles.typeLabel}>{evento.tipo.toUpperCase()}</p>
        </div>
      </div>
      
      <div className={styles.body}>
        <div className={styles.infoRow}>
          <span className={styles.icon}>🕒</span>
          <div className={styles.timeBlock}>
            <span>{formatDateTime(evento.fecha_inicio)}</span>
            <span className={styles.timeSeparator}>-</span>
            <span>{formatDateTime(evento.fecha_fin)}</span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.icon}>📍</span>
          <span className={styles.infoText}>{evento.lugar || "Sin ubicación definida"}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.icon}>💳</span>
          <span className={styles.priceText}>
            {isFree ? (
              <span className={styles.freeBadge}>Gratuito</span>
            ) : (
              `${Number(evento.precio_inscripcion).toFixed(2)} € / Inscripción`
            )}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.primaryBtn} onClick={() => onView(evento.id)}>
          Ver Inscripciones
        </button>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(evento)}>
            ✏️ Editar
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(evento.id)}>
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
