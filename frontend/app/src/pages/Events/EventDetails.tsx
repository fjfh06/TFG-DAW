import { useState, useEffect } from "react";
import { eventAPI } from "../../services/event.service";
import { studentAPI } from "../../services/student.service";
import type { Evento, Participacion, Alumno, EstadoInscripcion, EstadoPagoParticipacion } from "../../types";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Events.module.css";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { SearchableSelect } from "../../components/common/SearchableSelect/SearchableSelect";
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  UserPlus, 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  Medal, 
  CreditCard,
  UserCheck
} from "lucide-react";

interface Props {
  evento: Evento;
  onBack: () => void;
}

const EventDetails = ({ evento, onBack }: Props) => {
  const [participaciones, setParticipaciones] = useState<Participacion[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useLoading(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [form, setForm] = useState({
    id: 0,
    alumno_id: "",
    categoria: "",
    estado_inscripcion: "inscrito" as EstadoInscripcion,
    estado_pago: "pendiente" as EstadoPagoParticipacion,
    precio_pactado: "" as string | number
  });

  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [resultForm, setResultForm] = useState({
    id: 0,
    participacion_id: 0,
    puesto: "",
    categoria_final: "",
    observaciones: "",
    student_name: ""
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [partsData, alumsData] = await Promise.all([
        eventAPI.getParticipaciones(evento.id),
        studentAPI.getStudents()
      ]);
      setParticipaciones(partsData);
      setAlumnos(alumsData);
    } catch {
      toast.error("Error al cargar datos del evento");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [evento.id]);

  const handleOpenForm = (p?: Participacion) => {
    if (p) {
      setForm({
        id: p.id,
        alumno_id: p.alumno_id.toString(),
        categoria: p.categoria || "",
        estado_inscripcion: p.estado_inscripcion,
        estado_pago: p.estado_pago,
        precio_pactado: p.precio_pactado || ""
      });
    } else {
      setForm({
        id: 0, alumno_id: "", categoria: "",
        estado_inscripcion: "inscrito", 
        estado_pago: (evento.precio_inscripcion === "0.00" || evento.precio_inscripcion === 0) ? "pagado" : "pendiente",
        precio_pactado: evento.precio_inscripcion
      });
    }
    setIsFormOpen(true);
    setResultFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.alumno_id) return toast.error("Seleccione alumno");

    try {
      const payload = {
        alumno_id: Number(form.alumno_id),
        categoria: form.categoria || undefined,
        estado_inscripcion: form.estado_inscripcion,
        estado_pago: form.estado_pago,
        precio_pactado: form.precio_pactado || undefined
      };
      
      if (form.id) {
        await eventAPI.updateParticipacion(form.id, payload);
        toast.success("Inscripción actualizada");
      } else {
        await eventAPI.createParticipacion(evento.id, payload);
        toast.success("Alumno inscrito con éxito");
      }
      setIsFormOpen(false);
      fetchData();
    } catch {
       toast.error("Error procesando inscripción");
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Seguro que deseas eliminar la inscripción?")) return;
    try {
      await eventAPI.deleteParticipacion(id);
      toast.success("Inscripción eliminada");
      fetchData();
    } catch {
      toast.error("Error al eliminar la inscripción");
    }
  };

  const handleOpenResultForm = (p: Participacion) => {
    const alum = getStudent(p.alumno_id);
    const sName = alum ? `${alum.nombre} ${alum.apellidos}` : "Alumno";
    
    if (p.resultado) {
      setResultForm({
        id: p.resultado.id,
        participacion_id: p.id,
        puesto: p.resultado.puesto || "",
        categoria_final: p.resultado.categoria_final || "",
        observaciones: p.resultado.observaciones || "",
        student_name: sName
      });
    } else {
      setResultForm({
        id: 0, participacion_id: p.id, puesto: "",
        categoria_final: p.categoria || "", observaciones: "",
        student_name: sName
      });
    }
    setResultFormOpen(true);
    setIsFormOpen(false);
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        puesto: resultForm.puesto,
        categoria_final: resultForm.categoria_final,
        observaciones: resultForm.observaciones
      };
      if (resultForm.id) {
        await eventAPI.updateResultado(resultForm.id, payload);
      } else {
        await eventAPI.createResultado(resultForm.participacion_id, payload);
      }
      setResultFormOpen(false);
      fetchData();
      toast.success("Resultado guardado");
    } catch {
      toast.error("Error registrando resultado");
    }
  };

  const getStudent = (id: number) => alumnos.find(a => a.id === id);

  const totalRecaudado = participaciones
    .filter(p => p.estado_pago === 'pagado')
    .reduce((acc, current) => acc + Number(current.precio_pactado || 0), 0);

  if (isLoading) return <Loader text="Cargando datos del evento..." />;

  return (
    <div className={styles.container}>
      <div className={styles.eventHero}>
        <button className={styles.backButton} onClick={onBack} title="Volver">
          <ChevronLeft size={24} />
        </button>
        
        <div className={styles.heroContent}>
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Trophy size={20} />
            <span className="text-xs font-black uppercase tracking-widest">{evento.tipo.toUpperCase()}</span>
          </div>
          <h2 className={styles.heroTitle}>{evento.nombre}</h2>
          
          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <MapPin size={18} />
              <span>{evento.lugar || 'Ubicación Pendiente'}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={18} />
              <span>{new Date(evento.fecha_inicio).toLocaleDateString()}</span>
            </div>
            <div className={styles.metaItem}>
              <CreditCard size={18} />
              <span>Cuota Base: {Number(evento.precio_inscripcion).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className="card text-center p-8 bg-blue-50/30 border-blue-100 border">
          <p className="text-xs uppercase font-black text-gray-400 mb-2">Total Inscripciones</p>
          <h1 className="text-4xl font-black text-blue-600">{participaciones.length}</h1>
        </div>
        <div className="card text-center p-8 bg-emerald-50/30 border-emerald-100 border">
          <p className="text-xs uppercase font-black text-gray-400 mb-2">Total Recaudado</p>
          <h1 className="text-4xl font-black text-emerald-600">{totalRecaudado.toFixed(2)}€</h1>
        </div>
      </div>

      <div className={styles.consoleTableWrapper}>
        <div className={styles.consoleHeader}>
          <div className={styles.consoleTitle}>
             <UserCheck size={24} className="text-indigo-600" /> Listado de Inscripciones
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <UserPlus size={18} className="mr-2" /> Inscribir Alumno
          </button>
        </div>

        {isFormOpen && (
           <div className="formGlass mb-12 animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-2xl font-black mb-8">{form.id ? "Actualizar Inscripción" : "Nueva Inscripción"}</h3>
              <form onSubmit={handleSubmit}>
                 {!form.id && (
                    <div className="formGroup mb-6">
                       <label>Alumno *</label>
                       <SearchableSelect 
                          options={alumnos.filter(a => a.activo).map(a => ({
                              id: a.id,
                              label: `${a.nombre} ${a.apellidos}`,
                              sublabel: a.dni || '',
                              image: a.foto
                          }))}
                          value={form.alumno_id}
                          onChange={(id) => setForm({...form, alumno_id: id.toString()})}
                          placeholder="Busca un alumno..."
                       />
                    </div>
                 )}

                 <div className="formRow mb-6">
                    <div className="formGroup">
                       <label>Categoría</label>
                       <input className="inputField" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} placeholder="Ej: Mano Vacia Masculino +18" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="formGroup">
                       <label>Estado del Pago</label>
                       <select className="inputField" value={form.estado_pago} onChange={e => setForm({...form, estado_pago: e.target.value as EstadoPagoParticipacion})}>
                          <option value="pagado">Pagado</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="no_aplica">No Aplica</option>
                       </select>
                    </div>
                    <div className="formGroup">
                       <label>Precio Final (€)</label>
                       <input type="number" step="0.01" className="inputField" value={form.precio_pactado} onChange={e => setForm({...form, precio_pactado: e.target.value})} />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                 </div>
              </form>
           </div>
        )}

        {resultFormOpen && (
           <div className="formGlass mb-12 animate-in slide-in-from-top-4 duration-300 border-amber-200">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                 <Trophy className="text-amber-500" /> Resultados: {resultForm.student_name}
              </h3>
              <form onSubmit={handleResultSubmit}>
                 <div className="formRow mb-6">
                    <div className="formGroup">
                       <label>Puesto / Medalla</label>
                       <input className="inputField" value={resultForm.puesto} onChange={e => setResultForm({...resultForm, puesto: e.target.value})} placeholder="Ej: Oro, 1er Puesto, 3º..." />
                    </div>
                    <div className="formGroup">
                       <label>Categoría Final</label>
                       <input className="inputField" value={resultForm.categoria_final} onChange={e => setResultForm({...resultForm, categoria_final: e.target.value})} />
                    </div>
                 </div>

                 <div className="formGroup mb-8">
                    <label>Observaciones</label>
                    <textarea className="inputField min-h-[100px]" value={resultForm.observaciones} onChange={e => setResultForm({...resultForm, observaciones: e.target.value})} />
                 </div>

                 <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="btn btn-secondary" onClick={() => setResultFormOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-amber-600)', borderColor: 'var(--color-amber-600)' }}>Guardar Resultado</button>
                 </div>
              </form>
           </div>
        )}

        <div className="tableWrapper">
          <table className="premiumTable">
            <thead>
              <tr>
                <th className="sticky-col">Alumno (Inscripción)</th>
                <th>Categoría</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Resultado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {participaciones.map(p => {
                const alum = getStudent(p.alumno_id);
                return (
                  <tr key={p.id}>
                    <td className="sticky-col">
                      <div className="flex items-center gap-3">
                         <StudentAvatar photoUrl={alum?.foto} name={alum?.nombre || ''} lastName={alum?.apellidos || ''} size="sm" />
                         <div>
                            <p className="font-bold text-sm leading-tight">{alum ? `${alum.nombre} ${alum.apellidos}` : '?'}</p>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{alum?.dni}</span>
                         </div>
                      </div>
                    </td>
                    <td className="text-sm font-bold text-gray-600">{p.categoria || 'General'}</td>
                    <td>
                      <span className={`badge ${p.estado_pago === 'pagado' ? styles.badgePaid : p.estado_pago === 'pendiente' ? styles.badgePending : styles.badgeFree}`}>
                        {p.estado_pago}
                      </span>
                    </td>
                    <td className="text-xs font-black uppercase text-gray-400 italic">{p.estado_inscripcion}</td>
                    <td>
                       {p.resultado ? (
                          <div className="flex items-center gap-2 text-indigo-600 font-bold italic">
                             <Medal size={14} className={p.resultado.puesto?.toLowerCase().includes('oro') ? 'text-amber-500' : 'text-gray-400'} />
                             {p.resultado.puesto}
                          </div>
                       ) : <span className="text-gray-200">-</span>}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        {evento.tipo === 'campeonato' && (
                           <button className={styles.actionBtn} onClick={() => handleOpenResultForm(p)} title="Resultados">
                             <Trophy size={14} />
                           </button>
                        )}
                        <button className={styles.actionBtn} onClick={() => handleOpenForm(p)}>
                           <Edit3 size={14} />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                           <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EventDetails;
