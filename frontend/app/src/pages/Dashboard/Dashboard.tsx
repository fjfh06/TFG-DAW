import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSeason } from "../../hooks/useSeason";

const YinYangIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

import { dashboardAPI, type DashboardStats } from "../../services/dashboard.service";
import { StatCard } from "../../components/common/StatCard/StatCard";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Dashboard.module.css";
import { toast } from "sonner";
import { eventAPI } from "../../services/event.service";
import { StudentDashboardView } from "./StudentDashboardView";
import { studentAPI } from "../../services/student.service";
import { licenciaAPI, licenseTypeAPI } from "../../services/license.service";
import { LicenseCard } from "../../components/common/LicenseCard/LicenseCard";
import type { Alumno, LicenciaAlumno, TipoLicencia } from "../../types";

const Dashboard = () => {
  const { user } = useAuth();
  const { currentSeason } = useSeason();
  
  const [stats, setStats] = useState<DashboardStats>({
    sin_licencia: [],
    sin_mes_actual: [],
    meses_anteriores_deuda: [],
    total_activos: 0
  });

  const [eventosTemporada, setEventosTemporada] = useState(0);
  const [isLoading, setIsLoading] = useLoading(true);

  // States for linked admin student card
  const [linkedAlumno, setLinkedAlumno] = useState<Alumno | null>(null);
  const [linkedLicencia, setLinkedLicencia] = useState<LicenciaAlumno | null>(null);
  const [linkedTipoLicencia, setLinkedTipoLicencia] = useState<TipoLicencia | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        if (currentSeason && user?.rol === 'admin') {
          // 1. Fetch administrative stats
          const statsData = await dashboardAPI.getStats(currentSeason.id);
          setStats(statsData);

          const eventos = await eventAPI.getEventos(currentSeason.id);
          setEventosTemporada(eventos.length);

          // 2. Async check if this admin has a linked student record
          const alumnosData = await studentAPI.getStudents();
          const myAlumno = alumnosData.find(a => a.user_id === user.id);
          
          if (myAlumno) {
            setLinkedAlumno(myAlumno);
            
            const [misLicencias, tiposDisp] = await Promise.all([
              licenciaAPI.getLicencias(myAlumno.id, currentSeason.id),
              licenseTypeAPI.getTipos(currentSeason.id)
            ]);
            
            if (misLicencias.length > 0) {
              const lic = misLicencias[0];
              setLinkedLicencia(lic);
              setLinkedTipoLicencia(tiposDisp.find(t => t.id === lic.tipo_licencia_id) || null);
            }
          }
        }
      } catch {
        toast.error("Error al cargar las métricas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentSeason, user, setIsLoading]);
  
  if (user?.rol === 'user' || user?.rol === 'ayudante') {
     return (
       <div className={styles.container}>
         <div className={styles.welcomeCard}>
            <h2 className="flex items-center gap-2">Hola, {user?.nombre} <YinYangIcon size={28} /></h2>
            <p>
              Bienvenido al panel, estás en la temporada: <strong>{currentSeason?.nombre || "Ninguna"}</strong>
            </p>
         </div>
         <div className="mt-4">
            <StudentDashboardView />
         </div>
       </div>
     );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <h2 className="flex items-center gap-2">Hola, {user?.nombre} <YinYangIcon size={28} /></h2>
        <p>
          Bienvenido al panel de control del Club Shaolin Las Gabias.
          Estás gestionando la temporada: <strong>{currentSeason?.nombre || "Ninguna"}</strong>
        </p>
      </div>

      {linkedAlumno ? (
        <div className={styles.adminMainLayout}>
          
          {/* Section: Alertas */}
          <div className={`${styles.section} ${styles.alertsSection}`}>
            <h3 className={styles.sectionHeader}>Alertas y Seguimiento</h3>
            {isLoading ? (
              <Loader text="Cargando métricas..." />
            ) : (
              <div className={styles.alertsGrid}>
                <StatCard
                  title="Sin Licencia"
                  count={stats.sin_licencia.length}
                  icon={<ShieldAlert size={20} />}
                  theme="warning"
                  students={stats.sin_licencia.slice(0, 5)}
                  actionLink="/licencias?filtro=sin_licencia"
                  actionText="Ir a Licencias"
                  emptyMessage="Todos los activos tienen licencia"
                />

                <StatCard
                  title="Sin Pagar Mes Actual"
                  count={stats.sin_mes_actual.length}
                  icon={<CreditCard size={20} />}
                  theme="danger"
                  students={stats.sin_mes_actual.slice(0, 5)}
                  actionLink="/cobros?filtro=pendientes"
                  actionText="Revisar Cobros"
                  emptyMessage="Todo al día este mes"
                />

                <StatCard
                  title="Deudas de Meses Anteriores"
                  count={stats.meses_anteriores_deuda.length}
                  icon={<AlertTriangle size={20} />}
                  theme="danger"
                  students={stats.meses_anteriores_deuda.slice(0, 5)}
                  actionLink="/cobros?filtro=morosos"
                  actionText="Revisar Historial"
                  emptyMessage="Ninguna deuda acumulada"
                />
              </div>
            )}
          </div>

          {/* Section: Summary */}
          <div className={`${styles.section} ${styles.summarySection}`}>
            <h3 className={styles.sectionHeader}>Resumen General</h3>
            {!isLoading && (
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>Alumnos Activos</div>
                  <div className={styles.metricValue}>{stats.total_activos}</div>
                  <div className={styles.metricSub}>Suscritos al club</div>
                </div>
                
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>Eventos Programados</div>
                  <div className={styles.metricValue}>{eventosTemporada}</div>
                  <div className={styles.metricSub}>En esta temporada</div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Shortcuts */}
          <div className={styles.shortcutsSection}>
             <h4>Accesos Rápidos</h4>
             <div className={styles.shortcutsGrid}>
               <Link to="/alumnos/nuevo" className="btn btn-primary">+ Nuevo Alumno</Link>
               <Link to="/asistencia" className="btn bg-white border border-gray-300 text-gray-800">Pasar Lista Hoy</Link>
               <Link to="/cobros" className="btn bg-white border border-gray-300 text-gray-800">Revisar Pagos</Link>
               <Link to="/eventos" className="btn bg-white border border-gray-300 text-gray-800">Ver Eventos</Link>
             </div>
          </div>

          {/* Right Column: Personal digital license card (top right, non-sticky) */}
          <div className={styles.licenseSection}>
            <LicenseCard 
              alumno={linkedAlumno} 
              licencia={linkedLicencia} 
              tipoLicencia={linkedTipoLicencia} 
            />
          </div>

        </div>
      ) : (
        /* Standard Single Column Layout (No linked student) */
        <>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>Alertas y Seguimiento</h3>
            {isLoading ? (
              <Loader text="Cargando métricas..." />
            ) : (
              <div className={styles.alertsGrid}>
                <StatCard
                  title="Sin Licencia"
                  count={stats.sin_licencia.length}
                  icon={<ShieldAlert size={20} />}
                  theme="warning"
                  students={stats.sin_licencia.slice(0, 5)}
                  actionLink="/licencias?filtro=sin_licencia"
                  actionText="Ir a Licencias"
                  emptyMessage="Todos los activos tienen licencia"
                />

                <StatCard
                  title="Sin Pagar Mes Actual"
                  count={stats.sin_mes_actual.length}
                  icon={<CreditCard size={20} />}
                  theme="danger"
                  students={stats.sin_mes_actual.slice(0, 5)}
                  actionLink="/cobros?filtro=pendientes"
                  actionText="Revisar Cobros"
                  emptyMessage="Todo al día este mes"
                />

                <StatCard
                  title="Deudas de Meses Anteriores"
                  count={stats.meses_anteriores_deuda.length}
                  icon={<AlertTriangle size={20} />}
                  theme="danger"
                  students={stats.meses_anteriores_deuda.slice(0, 5)}
                  actionLink="/cobros?filtro=morosos"
                  actionText="Revisar Historial"
                  emptyMessage="Ninguna deuda acumulada"
                />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>Resumen General</h3>
            {!isLoading && (
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>Alumnos Activos</div>
                  <div className={styles.metricValue}>{stats.total_activos}</div>
                  <div className={styles.metricSub}>Suscritos al club</div>
                </div>
                
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>Eventos Programados</div>
                  <div className={styles.metricValue}>{eventosTemporada}</div>
                  <div className={styles.metricSub}>En esta temporada</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.shortcuts}>
             <h4>Accesos Rápidos</h4>
             <div className={styles.shortcutsGrid}>
               <Link to="/alumnos/nuevo" className="btn btn-primary">+ Nuevo Alumno</Link>
               <Link to="/asistencia" className="btn bg-white border border-gray-300 text-gray-800">Pasar Lista Hoy</Link>
               <Link to="/cobros" className="btn bg-white border border-gray-300 text-gray-800">Revisar Pagos</Link>
               <Link to="/eventos" className="btn bg-white border border-gray-300 text-gray-800">Ver Eventos</Link>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
