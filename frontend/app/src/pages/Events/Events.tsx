import { useState, useEffect } from "react";
import { eventAPI } from "../../services/event.service";
import type { Evento, TipoEvento, EstadoEvento } from "../../types";
import { useSeason } from "../../hooks/useSeason";
import { toast } from "sonner";
import styles from "./Events.module.css";
import EventDetails from "./EventDetails";
import { EventCard } from "./EventCard";

const Events = () => {
  const { currentSeason, isLoadingSeasons } = useSeason();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [form, setForm] = useState({
    id: 0,
    nombre: "",
    tipo: "campeonato" as TipoEvento,
    fecha_inicio: "",
    fecha_fin: "",
    lugar: "",
    precio_inscripcion: "",
    estado: "programado" as EstadoEvento,
  });

  const fetchEventos = async () => {
    try {
      setIsLoading(true);
      if (currentSeason) {
        const data = await eventAPI.getEventos(currentSeason.id);
        setEventos(data);
      } else {
        setEventos([]);
      }
    } catch {
      toast.error("Error al cargar los eventos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingSeasons) fetchEventos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeason, isLoadingSeasons]);

  const handleOpenForm = (e?: Evento) => {
    if (e) {
      setForm({
        id: e.id,
        nombre: e.nombre,
        tipo: e.tipo,
        fecha_inicio: e.fecha_inicio.slice(0, 16), // datetime-local format
        fecha_fin: e.fecha_fin.slice(0, 16),
        lugar: e.lugar || "",
        precio_inscripcion: e.precio_inscripcion.toString(),
        estado: e.estado
      });
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const nowStr = now.toISOString().slice(0, 16);

      setForm({
        id: 0, nombre: "", tipo: "campeonato",
        fecha_inicio: nowStr, fecha_fin: nowStr,
        lugar: "", precio_inscripcion: "0", estado: "programado"
      });
    }
    setIsFormOpen(true);
    setSelectedEventId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeason) return toast.error("Seleccione una temporada activa");

    try {
      const payload = {
        nombre: form.nombre,
        tipo: form.tipo,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
        lugar: form.lugar,
        precio_inscripcion: Number(form.precio_inscripcion),
        estado: form.estado,
        temporada_id: currentSeason.id
      };

      if (form.id) {
        await eventAPI.updateEvento(form.id, payload);
        toast.success("Evento actualizado");
      } else {
        await eventAPI.createEvento(payload);
        toast.success("Evento credo");
      }
      setIsFormOpen(false);
      fetchEventos();
    } catch(err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Error registrando evento");
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Seguro que deseas eliminar este evento?")) return;
    try {
      await eventAPI.deleteEvento(id);
      toast.success("Evento borrado");
      if (selectedEventId === id) setSelectedEventId(null);
      fetchEventos();
    } catch {
      toast.error("El evento no pudo ser borrado");
    }
  };



  if (!currentSeason) {
    return <div className="p-4 text-center text-gray-500">Seleccione temporada para gestionar eventos.</div>;
  }

  // If viewing details
  if (selectedEventId) {
     const evt = eventos.find(e => e.id === selectedEventId);
     if (evt) {
       return <EventDetails evento={evt} onBack={() => setSelectedEventId(null)} />;
     }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
           <h2>Eventos y Competiciones</h2>
           <p className="text-gray-600">Calendario, competiciones, exámenes y sus inscripciones.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          + Nuevo Evento
        </button>
      </div>

      <div className="premiumSearchContainer">
         <input 
            type="text" 
            placeholder="Buscar evento por nombre o tipo..." 
            className="premiumSearchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="premiumSearchIcon">🔍</span>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="formGlass mb-8 animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-2xl font-black mb-8">{form.id ? "Editar Evento" : "Crear Evento"}</h4>
          
          <div className="formRow">
            <div className="formGroup">
              <label>Nombre del Evento *</label>
              <input required className="inputField" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Campeonato de España 2026" />
            </div>
            <div className="formGroup">
              <label>Tipo *</label>
              <select required className="inputField" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as TipoEvento})}>
                <option value="campeonato">Campeonato</option>
                <option value="exhibicion">Exhibición</option>
                <option value="curso">Curso</option>
                <option value="concentracion">Concentración</option>
                <option value="examen">Examen</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="formGroup">
              <label>Fecha y Hora Inicio *</label>
              <input required type="datetime-local" className="inputField" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} />
            </div>
            <div className="formGroup">
              <label>Fecha y Hora Fin *</label>
              <input required type="datetime-local" className="inputField" value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} />
            </div>
          </div>

          <div className="formRow">
             <div className="formGroup">
              <label>Lugar</label>
              <input className="inputField" value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})} placeholder="Ej: Polideportivo Municipal..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="formGroup">
              <label>Precio Insc. (€)</label>
              <input type="number" step="0.01" className="inputField" value={form.precio_inscripcion} onChange={e => setForm({...form, precio_inscripcion: e.target.value})} />
            </div>
            <div className="formGroup">
              <label>Estado *</label>
              <select required className="inputField" value={form.estado} onChange={e => setForm({...form, estado: e.target.value as EstadoEvento})}>
                <option value="programado">Programado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Evento</button>
          </div>
        </form>
      )}

      <div className={styles.eventGrid}>
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            No hay eventos registrados en esta temporada.
          </div>
        ) : (
          eventos.filter(e => 
            e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
            e.tipo.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(e => (
            <EventCard
              key={e.id}
              evento={e}
              onEdit={(evt) => handleOpenForm(evt)}
              onDelete={(id) => handleDelete(id)}
              onView={(id) => setSelectedEventId(id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
