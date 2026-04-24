import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSeason } from "../../hooks/useSeason";
import { dashboardAPI, type DashboardStats } from "../../services/dashboard.service";
import { StatCard } from "../../components/common/StatCard/StatCard";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Dashboard.module.css";
import { toast } from "sonner";
import { eventAPI } from "../../services/event.service";
import { StudentDashboardView } from "./StudentDashboardView";

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        if (currentSeason && user?.rol === 'admin') {
          const statsData = await dashboardAPI.getStats(currentSeason.id);
          setStats(statsData);

          const eventos = await eventAPI.getEventos(currentSeason.id);
          setEventosTemporada(eventos.length);
        }
      } catch {
        toast.error("Error al cargar las métricas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentSeason, user]);
  
  if (user?.rol === 'user' || user?.rol === 'ayudante') {
     return (
       <div className={styles.container}>
         <div className={styles.welcomeCard}>
            <h2>Hola, {user?.nombre} 👋</h2>
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
        <h2>Hola, {user?.nombre} 👋</h2>
        <p>
          Bienvenido al panel de control del Club Shaolin Las Gabias.
          Estás gestionando la temporada: <strong>{currentSeason?.nombre || "Ninguna"}</strong>
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionHeader}>Alertas y Seguimiento</h3>

        {isLoading ? (
          <Loader text="Cargando métricas..." />
        ) : (
          <div className={styles.alertsGrid}>
            <StatCard
              title="Sin Licencia"
              count={stats.sin_licencia.length}
              icon="🛡️"
              theme="warning"
              students={stats.sin_licencia.slice(0, 5)}
              actionLink="/licencias?filtro=sin_licencia"
              actionText="Ir a Licencias"
              emptyMessage="Todos los activos tienen licencia"
            />

            <StatCard
              title="Sin Pagar Mes Actual"
              count={stats.sin_mes_actual.length}
              icon="💳"
              theme="danger"
              students={stats.sin_mes_actual.slice(0, 5)}
              actionLink="/cobros?filtro=pendientes"
              actionText="Revisar Cobros"
              emptyMessage="Todo al día este mes"
            />

            <StatCard
              title="Deudas de Meses Anteriores"
              count={stats.meses_anteriores_deuda.length}
              icon="⚠️"
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
    </div>
  );
};

export default Dashboard;
