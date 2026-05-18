import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSeason } from "../../hooks/useSeason";
import { studentAPI } from "../../services/student.service";
import { pagoAPI } from "../../services/payment.service";
import { licenciaAPI, licenseTypeAPI } from "../../services/license.service";
import type { Alumno, PagoMensualidad, LicenciaAlumno, TipoLicencia } from "../../types";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { LicenseCard } from "../../components/common/LicenseCard/LicenseCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import styles from "./StudentDashboardView.module.css";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  LayoutDashboard,
  Users,
  Award,
  Clock,
  Zap
} from "lucide-react";

export const StudentDashboardView = () => {
  const { user } = useAuth();
  const { currentSeason } = useSeason();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [pagos, setPagos] = useState<PagoMensualidad[]>([]);
  const [licencia, setLicencia] = useState<LicenciaAlumno | null>(null);
  const [tipoLicencia, setTipoLicencia] = useState<TipoLicencia | null>(null);
  const [isLoading, setIsLoading] = useLoading(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!user || !currentSeason) return;

        const alumnosData = await studentAPI.getStudents();
        const myAlumno = alumnosData.find(a => a.user_id === user.id);
        
        if (!myAlumno) {
           setAlumno(null);
           return;
        }

        setAlumno(myAlumno);

        const [misPagos, misLicencias, tiposDisp] = await Promise.all([
          pagoAPI.getPagos(myAlumno.id),
          licenciaAPI.getLicencias(myAlumno.id, currentSeason.id),
          licenseTypeAPI.getTipos(currentSeason.id)
        ]);

        setPagos(misPagos);

        if (misLicencias.length > 0) {
           const lic = misLicencias[0];
           setLicencia(lic);
           setTipoLicencia(tiposDisp.find(t => t.id === lic.tipo_licencia_id) || null);
        } else {
           setLicencia(null);
        }

      } catch (error) {
        toast.error("Error al cargar la plataforma");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, currentSeason, setIsLoading]);

  if (isLoading) {
    return <Loader text="Sincronizando Corazón del Club..." />;
  }

  if (!alumno) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
           <Users size={48} />
        </div>
        <h3 className={styles.emptyTitle}>Perfil No Vinculado</h3>
        <p className={styles.emptyText}>
          Hola <strong>{user?.nombre}</strong>. Tu acceso aún no ha sido enlazado con tu ficha personal de alumno.
          Por favor, solicita al administrador del club que complete la vinculación de tu usuario.
        </p>
        <div className={styles.contactBtn}>
           Hable con Shifu
         </div>
      </div>
    );
  }

  // Monthly Logic
  const startMonth = currentSeason ? new Date(currentSeason.fecha_inicio).getMonth() + 1 : 1;
  const startYear = currentSeason ? new Date(currentSeason.fecha_inicio).getFullYear() : 2024;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const expectedMonths = [];
  let t_y = startYear;
  let t_m = startMonth;
  while(t_y < currentYear || (t_y === currentYear && t_m <= currentMonth)) {
     expectedMonths.push({ mes: t_m, anio: t_y });
     t_m++;
     if (t_m > 12) { t_m = 1; t_y++; }
  }

  const unpaidMonths = expectedMonths.filter(em => {
     return !pagos.some(p => p.mes === em.mes && p.anio === em.anio && p.estado === 'pagado');
  });

  const paidMonths = pagos.filter(p => p.estado === 'pagado').slice(-4).reverse();

  return (
    <div className={styles.container}>
      
      {/* 1. STUDENT HERO PROFILE */}
      <div className={styles.heroWrapper}>
         <div className={styles.heroContent}>
           <div className={styles.avatarWrapper}>
             <StudentAvatar photoUrl={alumno.foto} name={alumno.nombre} lastName={alumno.apellidos} size="xl" />
             <div className={styles.statusIcon}>
                <Zap size={14} fill="currentColor" />
             </div>
           </div>
           
           <div className={styles.heroText}>
             <div className={styles.heroBadges}>
               <span className={`${styles.badge} ${styles.badgeIndigo}`}>Sistema Activo</span>
               <span className={`${styles.badge} ${styles.badgeEmerald}`}>{currentSeason?.nombre}</span>
             </div>
             <h2 className={styles.heroTitle}>
                Hola, <span>{alumno.nombre}</span>
             </h2>
             <div className={styles.heroStats}>
                <div className={styles.statItem}>
                   <Award size={16} />
                   <span>Estado: {alumno.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className={styles.statItem}>
                   <Clock size={16} />
                   <span>Último acceso: Hoy</span>
                </div>
             </div>
           </div>
         </div>
       </div>
 
       <div className={styles.dashboardGrid}>
         
         {/* 2. FISCAL MONITOR (LEFT) */}
         <div className={styles.cardBase}>
           <div className={styles.cardHeader}>
               <div className={styles.cardTitleWrapper}>
                 <div className={styles.cardIcon}>
                     <CreditCard size={24} />
                 </div>
                 <div>
                   <h3 className={styles.cardTitle}>Monitor de Pagos</h3>
                   <p className={styles.cardSubtitle}>Estado de Cuotas Anuales</p>
                 </div>
               </div>
           </div>
 
           <div className={styles.fiscalContent}>
               {/* Unpaid */}
               <div className={styles.section}>
                 <h4 className={styles.sectionTitle}>
                     <AlertCircle size={14} /> Mensualidades Pendientes
                 </h4>
                 {unpaidMonths.length > 0 ? (
                   <div className={styles.unpaidList}>
                     <div className={styles.monthsGrid}>
                         {unpaidMonths.map((m, i) => (
                           <div key={i} className={styles.monthTag}>
                             <div className={styles.monthTagYear}>{m.anio}</div>
                             <div className={styles.monthTagName}>{new Date(2000, m.mes-1).toLocaleString('es', { month: 'short' })}</div>
                           </div>
                         ))}
                     </div>
                   </div>
                 ) : (
                   <div className={styles.successBox}>
                       <CheckCircle2 size={32} />
                       <p className={styles.successTitle}>Cuotas al día</p>
                       <p className={styles.successSubtitle}>No tienes pagos pendientes.</p>
                   </div>
                 )}
               </div>
 
               {/* History */}
               <div className={styles.section}>
                 <h4 className={styles.sectionTitle}>
                     <CheckCircle2 size={14} /> Historial Reciente
                 </h4>
                 <div className={styles.paidHistory}>
                     {paidMonths.map(p => (
                       <div key={p.id} className={styles.paidItem}>
                         <div className={styles.paidItemInfo}>
                             <div className={styles.monthNumBadge}>{p.mes}</div>
                             <div>
                               <div className={styles.paidMonthName}>
                                 {new Date(2000, p.mes-1).toLocaleString('es', { month: 'long' })}
                               </div>
                               <div className={styles.liquidatedBadge}>Recibo OK</div>
                             </div>
                         </div>
                         <div className={styles.paidAmount}>{parseFloat(p.cantidad.toString()).toFixed(2)}€</div>
                       </div>
                     ))}
                     {paidMonths.length === 0 && (
                       <div className={styles.emptyHistory}>Sin datos de pago</div>
                     )}
                 </div>
               </div>
           </div>
         </div>
 
         {/* 3. DIGITAL LICENSE (RIGHT - VERTICALLY CENTERED) */}
         <div className={styles.licenseColumn}>
            <LicenseCard 
              alumno={alumno} 
              licencia={licencia} 
              tipoLicencia={tipoLicencia} 
            />
         </div>
 
       </div>

       {/* 4. ASSISTANT COMMAND CENTER (BOTTOM PANEL) */}
       {user?.rol === 'ayudante' && (
         <div className={styles.assistantZone} style={{ marginTop: '1.5rem' }}>
            <div className={styles.zoneHeader}>
                <div className={styles.zoneIconWrapper}>
                  <LayoutDashboard size={20} />
                </div>
                <h3 className={styles.zoneTitle}>Panel de Control</h3>
            </div>

            <div>
               {[
                  { label: "Pasar Asistencia", route: "/asistencia", icon: <CheckCircle2 size={18} /> },
                  { label: "Gestión Alumnos", route: "/alumnos", icon: <Users size={18} /> },
                  { label: "Eventos Club", route: "/eventos", icon: <Calendar size={18} /> }
               ].map((btn, i) => (
                 <button 
                   key={i} 
                   onClick={() => navigate(btn.route)} 
                   className={styles.actionButton}
                 >
                   <div className={styles.actionLabel}>
                      {btn.icon}
                      <span>{btn.label}</span>
                   </div>
                   <ArrowRight size={16} />
                 </button>
               ))}
            </div>
         </div>
       )}
    </div>
  );
};
