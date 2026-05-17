import { useState, useEffect, useMemo } from "react";
import { useSeason } from "../../hooks/useSeason";
import { studentAPI, cinturonAPI } from "../../services/student.service";
import { attendanceAPI } from "../../services/attendance.service";
import { eventAPI } from "../../services/event.service";
import type { Alumno, Asistencia, Evento, Cinturon } from "../../types";
import { toast } from "sonner";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { CalendarView } from "../../components/common/Calendar/CalendarView";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CheckCircle2, Search } from "lucide-react";
import styles from "./Attendance.module.css";

const Attendance = () => {
  const { currentSeason, isLoadingSeasons } = useSeason();
  
  // Helper to ensure date is a workday (Mon-Fri)
  const ensureWorkday = (dateObj: Date): string => {
    const day = dateObj.getDay();
    if (day === 0) { // Sunday
      dateObj.setDate(dateObj.getDate() - 2);
    } else if (day === 6) { // Saturday
      dateObj.setDate(dateObj.getDate() - 1);
    }
    return dateObj.toISOString().split('T')[0];
  };

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cinturones, setCinturones] = useState<Cinturon[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [date, setDate] = useState<string>(''); // YYYY-MM-DD
  const [isLoading, setIsLoading] = useLoading(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Month/Year for view navigation
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const filteredAlumnos = useMemo(() => alumnos.filter(a => 
    `${a.nombre} ${a.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [alumnos, searchTerm]);

  useEffect(() => {
     if (isLoadingSeasons) return;
     const today = new Date();
     let initialDate = today.toISOString().split('T')[0];
     
     if (currentSeason) {
        const seasonStart = new Date(currentSeason.fecha_inicio);
        const seasonEnd = new Date(currentSeason.fecha_fin);
        if (today < seasonStart) initialDate = currentSeason.fecha_inicio.split('T')[0];
        if (today > seasonEnd) initialDate = currentSeason.fecha_fin.split('T')[0];
     }

     const d = new Date(initialDate);
     const workdayDate = ensureWorkday(d);
     
     setDate(workdayDate);
     const finalDate = new Date(workdayDate);
     setViewMonth(finalDate.getMonth() + 1);
     setViewYear(finalDate.getFullYear());
  }, [currentSeason, isLoadingSeasons]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [alumnosData, cinturonesData] = await Promise.all([
        studentAPI.getStudents(),
        cinturonAPI.getCinturones()
      ]);
      setAlumnos(alumnosData.filter(a => a.activo));
      setCinturones(cinturonesData);
      
      if (currentSeason) {
         const evts = await eventAPI.getEventos(currentSeason.id);
         setEventos(evts);
      }
    } catch {
      toast.error("Error al cargar datos básicos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async (year: number, month: number) => {
    try {
      setIsLoading(true);
      const fechaInicio = `${year}-${String(month).padStart(2, '0')}-01`;
      const fechaFin = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      const data = await attendanceAPI.getAsistencias(fechaInicio, fechaFin);
      setAsistencias(data);
    } catch {
      toast.error("Error al cargar asistencias");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentSeason]);

  useEffect(() => {
    if (viewMonth && viewYear) {
      fetchAttendance(viewYear, viewMonth);
    }
  }, [viewMonth, viewYear, currentSeason]);

  const shiftMonth = (dir: number) => {
    let newMonth = viewMonth + dir;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const setToday = () => {
    const today = new Date();
    const workday = ensureWorkday(today);
    const d = new Date(workday);
    setDate(workday);
    setViewMonth(d.getMonth() + 1);
    setViewYear(d.getFullYear());
  };

  const handleBulkAttendance = async () => {
    const visibleAlumnos = filteredAlumnos.filter(a => !asistencias.some(as => as.alumno_id === a.id && as.fecha === date));
    if (visibleAlumnos.length === 0) {
       toast.info("Todos los alumnos visibles ya están marcados.");
       return;
    }

    const confirm = window.confirm(`¿Marcar a los ${visibleAlumnos.length} alumnos visibles como PRESENTES para el día ${date}?`);
    if (!confirm) return;

    try {
      setIsLoading(true);
      await Promise.all(visibleAlumnos.map(a => attendanceAPI.recordAsistencia(a.id, date)));
      toast.success("Asistencia masiva registrada");
      fetchAttendance(viewYear, viewMonth);
    } catch {
      toast.error("Error al registrar asistencia masiva");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendance = async (alumno_id: number) => {
    const record = asistencias.find(a => a.alumno_id === alumno_id && a.fecha === date);
    
    if (record) {
      setAsistencias(prev => prev.filter(a => a.id !== record.id));
      try {
        await attendanceAPI.deleteAsistencia(record.id);
      } catch {
        toast.error("No se pudo quitar la asistencia");
        fetchAttendance(viewYear, viewMonth);
      }
    } else {
      const tempId = Date.now();
      setAsistencias(prev => [...prev, { id: tempId, fecha: date, alumno_id }]);
      try {
        const res = await attendanceAPI.recordAsistencia(alumno_id, date);
        setAsistencias(prev => prev.map(a => a.id === tempId ? { ...a, id: res.id } : a));
      } catch {
        toast.error("No se pudo registrar la asistencia");
        fetchAttendance(viewYear, viewMonth);
      }
    }
  };

  const asistenciasDia = asistencias.filter(a => a.fecha === date);
  const selectedDayNum = parseInt(date.split('-')[2]);
  const monthName = new Date(viewYear, viewMonth - 1).toLocaleString('es', { month: 'long' });

  return (
    <div className={styles.container}>
      <div className={styles.masterHeader}>
        <div className={styles.titleArea}>
          <h1>Control de Asistencias</h1>
          <p>Gestiona y visualiza el historial de clases</p>
        </div>
        
        <div className={styles.navControl}>
          <div className={styles.dateSelectors}>
             <select value={viewMonth} onChange={e => setViewMonth(parseInt(e.target.value))}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('es', { month: 'long' })}</option>
                ))}
             </select>
             <select value={viewYear} onChange={e => setViewYear(parseInt(e.target.value))}>
                {[viewYear - 1, viewYear, viewYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
             </select>
          </div>

          <div className={styles.navActions}>
            <button className={styles.navBtn} onClick={() => shiftMonth(-1)} title="Mes Anterior">
              <ChevronLeft size={20} />
            </button>
            <button className={styles.navBtn} onClick={() => shiftMonth(1)} title="Mes Siguiente">
              <ChevronRight size={20} />
            </button>
            <button className={styles.todayBtn} onClick={setToday}>
              Hoy
            </button>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* LEFT COLUMN: CALENDAR */}
        <div className={styles.calendarSection}>
          <div className={styles.cardHeader}>
             <CalendarIcon size={18} />
             <h3>Calendario de {monthName}</h3>
          </div>
          <CalendarView 
            year={viewYear}
            month={viewMonth}
            events={eventos}
            attendances={asistencias}
            selectedDay={viewMonth === parseInt(date.split('-')[1]) ? selectedDayNum : undefined}
            onDayClick={(_, fullDate) => {
               const d = new Date(fullDate);
               setDate(ensureWorkday(d));
            }}
          />
          <div className={styles.calendarLegend}>
             <span><span className={styles.dotEvent}></span> Evento</span>
             <span><span className={styles.dotAtt}></span> Asistencia</span>
             <span><span className={styles.dotToday}></span> Día actual</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY LIST */}
        <div className={styles.attendanceSection}>
          <div className={styles.dayHeader}>
             <div className={styles.dayInfo}>
                <span className={styles.label}>Día Seleccionado</span>
                <h2>{new Date(date).toLocaleDateString('es', { day:'numeric', month:'long', year:'numeric' })}</h2>
             </div>
             <div className={styles.dayStats}>
                <div className={styles.smallStat}>
                   <Users size={14} />
                   <span>{asistenciasDia.length} Presentes</span>
                </div>
             </div>
          </div>

          <div className={styles.listControls}>
            <div className="premiumSearchContainer" style={{ flex: 1, marginBottom: 0, maxWidth: 'none' }}>
               <input 
                  type="text" 
                  placeholder="Buscar alumno..." 
                  className="premiumSearchInput"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
               <span className="premiumSearchIcon"><Search size={20} className="text-gray-400" /></span>
            </div>
            <button className={`${styles.bulkBtn} btn btn-secondary`} style={{ borderRadius: 'var(--radius-full)', height: '52px' }} onClick={handleBulkAttendance}>
               <CheckCircle2 size={18} />
               <span>Marcar todos</span>
            </button>
          </div>

          <div className={styles.studentList}>
            {isLoading ? (
              <Loader text="Cargando lista..." />
            ) : filteredAlumnos.length === 0 ? (
              <div className={styles.empty}>No hay alumnos que coincidan con la búsqueda.</div>
            ) : (
              filteredAlumnos.map((alumno) => {
                const isPresent = asistenciasDia.some(as => as.alumno_id === alumno.id);
                const belt = cinturones.find(c => c.id === alumno.grado_actual_id);
                
                return (
                  <div 
                    key={alumno.id} 
                    className={`${styles.studentRow} ${isPresent ? styles.rowPresent : ''}`}
                    onClick={() => toggleAttendance(alumno.id)}
                  >
                    <StudentAvatar photoUrl={alumno.foto} name={alumno.nombre} lastName={alumno.apellidos} size="sm" />
                    <div className={styles.studentDetails}>
                      <span className={styles.name}>{alumno.nombre} {alumno.apellidos}</span>
                      <span className={styles.belt}>{belt?.nombre || 'General'}</span>
                    </div>
                    <div className={`${styles.statusToggle} ${isPresent ? styles.statusActive : ''}`}>
                       {isPresent ? <CheckCircle2 size={20} /> : <div className={styles.circle} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
