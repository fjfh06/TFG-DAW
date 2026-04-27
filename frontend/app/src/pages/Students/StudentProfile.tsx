import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentAPI, cinturonAPI } from "../../services/student.service";
import { attendanceAPI } from "../../services/attendance.service";
import { pagoAPI } from "../../services/payment.service";
import { eventAPI } from "../../services/event.service";
import { licenciaAPI, licenseTypeAPI } from "../../services/license.service";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { CalendarView } from "../../components/common/Calendar/CalendarView";
import { useSeason } from "../../hooks/useSeason";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import { 
  ChevronDown, 
  Search, 
  CreditCard, 
  ArrowLeft, 
  Edit3, 
  Trophy,
  Shield
} from "lucide-react";
import type { Alumno, Cinturon, Asistencia, PagoMensualidad, Participacion, LicenciaAlumno, TipoLicencia, Evento } from "../../types";
import styles from "./StudentProfile.module.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [cinturones, setCinturones] = useState<Cinturon[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [pagos, setPagos] = useState<PagoMensualidad[]>([]);
  const [participaciones, setParticipaciones] = useState<Participacion[]>([]);
  const [licencias, setLicencias] = useState<LicenciaAlumno[]>([]);
  const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const { currentSeason, isLoadingSeasons } = useSeason();
  
  const [isLoading, setIsLoading] = useLoading(true);
  const [activeTab, setActiveTab] = useState<'info' | 'asistencia' | 'economia' | 'eventos'>('info');

  // Filtros Asistencia
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [filterMes, setFilterMes] = useState(currentMonth);
  const [filterAnio, setFilterAnio] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // UI States
  const [showLicenses, setShowLicenses] = useState(true);
  const [showPayments, setShowPayments] = useState(false);
  const [eventSearch, setEventSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [alumnoData, cinturonesData, pagosData] = await Promise.all([
          studentAPI.getStudent(Number(id)),
          cinturonAPI.getCinturones(),
          pagoAPI.getPagos(Number(id))
        ]);
        
        setAlumno(alumnoData);
        setCinturones(cinturonesData);
        setPagos(pagosData);

        // Intentar obtener asistencias, participaciones, licencias y eventos globales
        try {
            const [asistenciasData, participacionesData, licenciasData, tiposData, eventosData] = await Promise.all([
                attendanceAPI.getAsistenciasByAlumno(Number(id)),
                eventAPI.getParticipaciones(undefined, Number(id)).catch(() => []),
                licenciaAPI.getLicencias(Number(id)).catch(() => []),
                licenseTypeAPI.getTipos().catch(() => []),
                currentSeason ? eventAPI.getEventos(currentSeason.id).catch(() => []) : Promise.resolve([])
            ]);
            setAsistencias(asistenciasData);
            setParticipaciones(participacionesData);
            setLicencias(licenciasData);
            setTiposLicencia(tiposData);
            setEventos(eventosData);
        } catch {
            console.warn("Hubo un error cargando sub-recursos del alumno");
        }

      } catch {
        toast.error("Error al cargar el perfil del alumno");
        navigate("/alumnos");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingSeasons) fetchData();
  }, [id, navigate, currentSeason, isLoadingSeasons]);

  if (isLoading) return <Loader text="Cargando perfil..." />;
  if (!alumno) return <div className="text-center py-8">Alumno no encontrado</div>;

  const cinturonNombre = cinturones.find(c => c.id === alumno.grado_actual_id)?.nombre || "Sin cinturón";

  // Calcular asistencias del mes seleccionado, evitando bugs de Timezone (UTC vs Local)
  const asistenciasMes = asistencias.filter(a => {
      if (!a.fecha) return false;
      const dtStr = a.fecha.split('T')[0];
      const matchMonth = parseInt(dtStr.split('-')[1]);
      const matchYear = parseInt(dtStr.split('-')[0]);
      return matchMonth === filterMes && matchYear === filterAnio;
  });



  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h2>Ficha del Alumno</h2>
        <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/alumnos")}>
              <ArrowLeft size={18} className="mr-2" /> Volver
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/alumnos/editar/${alumno.id}`)}>
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <span>Editar</span>
              </div>
            </button>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.profileTop}>
          <StudentAvatar photoUrl={alumno.foto} name={alumno.nombre} lastName={alumno.apellidos} size="xl" />
          <div className={styles.profileInfo}>
            <h3>{alumno.nombre} {alumno.apellidos}</h3>
            <p>{alumno.dni ? `DNI: ${alumno.dni}` : 'Sin DNI registrado'}</p>
            <div className={styles.badges}>
              <span className={alumno.activo ? styles.badgeActive : styles.badgeInactive}>
                {alumno.activo ? 'Alumno Activo' : 'Alumno Inactivo'}
              </span>
              <span className={styles.badgeBelt}>
                Cinturón {cinturonNombre}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'info' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Información
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'asistencia' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('asistencia')}
          >
            Asistencia
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'economia' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('economia')}
          >
            Pagos
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'eventos' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </button>
        </div>

        <div className={styles.tabContent}>
          
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Nombre Completo</label>
                <p>{alumno.nombre} {alumno.apellidos}</p>
              </div>
              <div className={styles.infoItem}>
                <label>DNI</label>
                <p>{alumno.dni || "-"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Fecha de Nacimiento</label>
                <p>{alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString() : "-"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Teléfono</label>
                <p>{alumno.telefono || "-"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Dirección Postal</label>
                <p>{alumno.direccion || "-"}</p>
              </div>
            </div>
          )}

          {/* TAB: ASISTENCIA */}
          {activeTab === 'asistencia' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="formGroup">
                  <label className="font-medium text-sm text-gray-700">Mes:</label>
                  <select className="inputField" value={filterMes} onChange={e => setFilterMes(Number(e.target.value))}>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('es', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label className="font-medium text-sm text-gray-700">Año:</label>
                  <input type="number" className="inputField" value={filterAnio} onChange={e => setFilterAnio(Number(e.target.value))} />
                </div>
              </div>

              <div className="mb-6 p-5 bg-blue-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-center sm:text-left">
                  <div>
                      <h4 className="text-blue-900 font-bold mb-1 text-lg">Resumen Mensual</h4>
                      <p className="text-blue-700 text-sm">
                        Asistencias registradas
                      </p>
                  </div>
                  <div className="text-4xl font-black text-blue-700 bg-white px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto text-center">
                      {asistenciasMes.length} <span className="text-lg font-bold text-blue-400">/ {new Date(filterAnio, filterMes, 0).getDate()}</span>
                  </div>
              </div>

              <CalendarView 
                year={filterAnio}
                month={filterMes}
                events={eventos}
                attendances={asistenciasMes}
                showWeekends={false}
                onDayClick={(_, dateStr) => setSelectedDate(dateStr)}
                selectedDay={selectedDate ? parseInt(selectedDate.split('-')[2]) : undefined}
              />

              {selectedDate && (
                <div className="mt-6 p-4 bg-white border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h5 className="font-bold text-gray-800">Detalle del {new Date(selectedDate).toLocaleDateString('es', { day:'numeric', month:'long', year:'numeric' })}</h5>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedDate(null)}>✕</button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Regular Attendance */}
                    {asistencias.some(a => a.fecha.startsWith(selectedDate)) ? (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2 rounded-lg text-sm font-medium">
                        <span className="text-xl">✓</span> Asistió a clase
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 bg-gray-50 p-2 rounded-lg text-sm">
                        <span>No asistió a clase</span>
                      </div>
                    )}

                    {/* Events */}
                    {(() => {
                      const dayEvents = eventos.filter(e => e.fecha_inicio.startsWith(selectedDate));
                      const myParts = participaciones.filter(p => dayEvents.some(de => de.id === p.evento_id));
                      
                      if (dayEvents.length === 0) return null;

                      return dayEvents.map(ev => {
                         const part = myParts.find(p => p.evento_id === ev.id);
                         return (
                           <div key={ev.id} className="flex flex-col gap-1 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-blue-900 font-bold text-sm">⭐ Evento: {ev.nombre}</span>
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{ev.tipo.toUpperCase()}</span>
                              </div>
                              {part ? (
                                <div className="text-xs text-blue-700">
                                  Inscrito como: <strong>{part.categoria}</strong> | Estado: {part.estado_inscripcion}
                                  {part.resultado && <div className="mt-1 font-bold text-amber-700">🏆 Logro: {part.resultado.puesto}</div>}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 italic">No inscrito en este evento</div>
                              )}
                           </div>
                         );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ECONOMIA */}
          {activeTab === 'economia' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ACCORDION: LICENCIAS */}
              <div className={styles.accordionCard}>
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => setShowLicenses(!showLicenses)}
                >
                  <div className={styles.accordionTitle}>
                    <Shield size={22} className="text-blue-600" />
                    <span>Pagos Licencias</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {licencias.length}
                    </span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`${styles.accordionIcon} ${showLicenses ? styles.iconRotated : ''}`} 
                  />
                </button>
                
                {showLicenses && (
                  <div className={styles.accordionContent}>
                    {licencias.length === 0 ? (
                      <p className="text-gray-500 italic py-4 text-center">No hay licencias registradas para este alumno.</p>
                    ) : (
                      <div className="tableWrapper">
                        <table className="premiumTable">
                          <thead>
                            <tr>
                              <th>Certificación / Licencia</th>
                              <th>Estado</th>
                              <th className="text-right">Fecha Pago</th>
                            </tr>
                          </thead>
                          <tbody>
                            {licencias.map(l => (
                              <tr key={l.id}>
                                <td className="font-bold text-blue-900">
                                  {tiposLicencia.find(t => t.id === l.tipo_licencia_id)?.nombre || `Licencia #${l.tipo_licencia_id}`}
                                </td>
                                <td>
                                  <span className={l.estado_pago === 'pagado' ? styles.statusPaid : styles.statusPending}>
                                      {l.estado_pago}
                                  </span>
                                </td>
                                <td className="text-right font-medium text-gray-500">
                                  {l.fecha_pago ? new Date(l.fecha_pago).toLocaleDateString() : "Pendiente"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACCORDION: PAGOS */}
              <div className={styles.accordionCard}>
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => setShowPayments(!showPayments)}
                >
                  <div className={styles.accordionTitle}>
                    <CreditCard size={22} className="text-emerald-600" />
                    <span>Historial de Pagos Mensuales</span>
                    <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                      {pagos.length}
                    </span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`${styles.accordionIcon} ${showPayments ? styles.iconRotated : ''}`} 
                  />
                </button>

                {showPayments && (
                  <div className={styles.accordionContent}>
                    {pagos.length === 0 ? (
                      <p className="text-gray-500 italic py-4 text-center">No hay recibos registrados para este alumno.</p>
                    ) : (
                      <div className="tableWrapper">
                        <table className="premiumTable">
                          <thead>
                            <tr>
                              <th>Periodo</th>
                              <th>Cuota</th>
                              <th>Fecha Pago</th>
                              <th className="text-right">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...pagos].sort((a,b) => (b.anio*12 + b.mes) - (a.anio*12 + a.mes)).map(p => (
                              <tr key={p.id}>
                                <td className="font-bold">
                                  {new Date(p.anio, p.mes - 1).toLocaleString('es', { month: 'long', year: 'numeric' })}
                                </td>
                                <td className="font-medium">{p.cantidad}€</td>
                                <td className="text-gray-500">
                                  {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : "-"}
                                </td>
                                <td className="text-right">
                                  <span className={p.estado === 'pagado' ? styles.statusPaid : styles.statusPending}>
                                      {p.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: EVENTOS */}
          {activeTab === 'eventos' && (
            <div>
              <div className={styles.eventHeader}>
                <h4>Historial de Competiciones y Eventos</h4>
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    className={styles.searchInput}
                    placeholder="Buscar evento o resultado..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                  />
                </div>
              </div>

              {participaciones.length === 0 ? (
                  <p className="text-gray-500 italic py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    Este alumno no ha participado en ningún evento todavía.
                  </p>
              ) : (
                <div className="tableWrapper">
                  <table className="premiumTable">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Categoría</th>
                        <th>Pago</th>
                        <th>Inscripción</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participaciones.filter(p => {
                        const evt = eventos.find(e => e.id === p.evento_id);
                        const match = (evt?.nombre || "").toLowerCase().includes(eventSearch.toLowerCase()) ||
                                      (p.categoria || "").toLowerCase().includes(eventSearch.toLowerCase()) ||
                                      (p.resultado?.puesto || "").toLowerCase().includes(eventSearch.toLowerCase());
                        return match;
                      }).map(p => {
                        const evt = eventos.find(e => e.id === p.evento_id);
                        const puestoNum = p.resultado?.puesto ? parseInt(p.resultado.puesto) : null;
                        const showsTrophy = puestoNum && puestoNum <= 3;

                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="font-bold text-blue-900">{evt?.nombre || `Evento #${p.evento_id}`}</div>
                              <div className="text-xs text-gray-400">
                                {evt?.fecha_inicio ? new Date(evt.fecha_inicio).toLocaleDateString() : "-"}
                              </div>
                            </td>
                            <td className="text-gray-600 font-medium">{p.categoria || "-"}</td>
                            <td>
                               <span className={p.estado_pago === 'pagado' ? styles.statusPaid : styles.statusPending}>
                                  {p.estado_pago}
                               </span>
                            </td>
                            <td>
                               <span className={p.estado_inscripcion === 'inscrito' ? styles.statusPaid : styles.statusPending}>
                                  {p.estado_inscripcion}
                               </span>
                            </td>
                            <td className="font-bold">
                              {p.resultado?.puesto ? (
                                <div className="flex items-center gap-1">
                                  {showsTrophy && <Trophy size={16} className="text-amber-500" />}
                                  <span className={showsTrophy ? "text-amber-700" : "text-gray-700"} style={{ padding: "0.25rem" }}>
                                     {p.resultado.puesto}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 font-normal italic text-xs">Sin resultado</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
