import React from 'react';
import type { Evento, Asistencia } from "../../../types";
import styles from "./CalendarView.module.css";
import { User } from "lucide-react";

interface CalendarViewProps {
  year: number;
  month: number;
  events?: Evento[];
  attendances?: Asistencia[];
  onDayClick?: (day: number, dateStr: string) => void;
  selectedDay?: number;
  showWeekends?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  year,
  month,
  events = [],
  attendances = [],
  onDayClick,
  selectedDay,
  showWeekends = false
}) => {
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  let firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Sunday is 7 to align easily with Monday=1
  
  const emptySpaces = Math.max(0, firstDayOfWeek - 1);
  const daysHeader = showWeekends 
    ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  const getDayEvents = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.fecha_inicio.startsWith(dateStr));
  };

  const getDayAttendanceCount = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendances.filter(a => a.fecha && a.fecha.startsWith(dateStr)).length;
  };

  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;

  return (
    <div className={styles.calendarWrapper}>
      <div 
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${daysHeader.length}, minmax(0, 1fr))` }}
      >
        {daysHeader.map(d => (
          <div key={d} className={styles.headerCell}>{d}</div>
        ))}
        
        {Array.from({ length: emptySpaces }).map((_, i) => {
           // Si no mostramos findes, y el hueco vacío cae en finde, no lo pintamos
           const virtualDayOfWeek = i + 1;
           if (!showWeekends && virtualDayOfWeek > 5) return null;
           return <div key={`empty-${i}`} className={styles.emptyCell}></div>;
        })}

        {daysArray.map(day => {
          const dateObj = new Date(year, month - 1, day);
          const dow = dateObj.getDay();
          if (!showWeekends && (dow === 0 || dow === 6)) return null;

          const dayEvents = getDayEvents(day);
          const attCount = getDayAttendanceCount(day);
          const isToday = isCurrentMonth && day === currentDay;
          const isSelected = selectedDay === day;

          const hasEvent = dayEvents.length > 0;
          const hasAttendance = attCount > 0;

          // Determinar estado visual
          let cardStyle = styles.cellNormal;
          let icon: React.ReactNode = null;

          if (hasEvent && hasAttendance) {
            cardStyle = styles.cellEventAssisted;
            icon = <div className="flex gap-0.5"></div>;
          } else if (hasEvent) {
             cardStyle = styles.cellEvent;
          } else if (hasAttendance) {
             cardStyle = styles.cellAssisted;
             
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
             <div 
                key={day}
                onClick={() => onDayClick?.(day, dateStr)}
                className={`
                  ${styles.cell} 
                  ${cardStyle} 
                  ${isToday ? styles.isToday : ''} 
                  ${isSelected ? styles.isSelected : ''}
                  ${onDayClick ? styles.clickable : ''}
                `}
             >
                <div className={styles.dayNumber}>{day}</div>
                
                <div className={styles.indicators}>
                   {hasEvent && (
                     <div className={styles.eventBadge}>
                        {dayEvents[0].tipo.substring(0,4).toUpperCase()}
                     </div>
                   )}
                   {attCount > 0 && (
                     <div className={styles.attBadge}>
                        <span className="flex items-center gap-0.5">{attCount} <User size={10} /></span>
                     </div>
                   )}
                </div>

                {icon && <div className={styles.bgIcon}>{icon}</div>}
             </div>
          );
        })}
      </div>
    </div>
  );
};
