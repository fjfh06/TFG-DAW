import { useState, useEffect } from "react";
import { tarifaAPI } from "../../services/payment.service";
import type { TarifaMensual } from "../../types";
import { useSeason } from "../../hooks/useSeason";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Payments.module.css";

const RatesTab = () => {
  const { currentSeason, isLoadingSeasons } = useSeason();
  const [tarifas, setTarifas] = useState<TarifaMensual[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useLoading(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [form, setForm] = useState({ id: 0, nombre: "", precio_base: "" });

  const fetchTarifas = async () => {
    try {
      if (currentSeason) {
        const data = await tarifaAPI.getTarifas(currentSeason.id);
        setTarifas(data);
      } else {
        setTarifas([]);
      }
    } catch {
      toast.error("Error al cargar las tarifas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingSeasons) {
        fetchTarifas();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeason, isLoadingSeasons]);

  const handleOpenForm = (t?: TarifaMensual) => {
    if (t) {
      setForm({ id: t.id, nombre: t.nombre, precio_base: t.precio_base.toString() });
    } else {
      setForm({ id: 0, nombre: "", precio_base: "" });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeason) return toast.error("No hay temporada seleccionada");

    try {
      const payload = {
        nombre: form.nombre,
        precio_base: Number(form.precio_base),
        temporada_id: currentSeason.id
      };

      if (form.id) {
        await tarifaAPI.updateTarifa(form.id, payload);
        toast.success("Tarifa actualizada");
      } else {
        await tarifaAPI.createTarifa(payload);
        toast.success("Tarifa creada");
      }
      setIsFormOpen(false);
      fetchTarifas();
    } catch (error) {
      if(error instanceof Error){
          toast.error(error.message);
      } else {
          toast.error("Error al procesar la tarifa");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarifa? Asegúrate de que no haya alumnos inscritos a ella.")) return;
    try {
      await tarifaAPI.deleteTarifa(id);
      toast.success("Tarifa eliminada");
      fetchTarifas();
    } catch {
      toast.error("Error al eliminar la tarifa (puede estar en uso)");
    }
  };

  if (!currentSeason) {
    return <div className="text-gray-500">Seleccione una temporada en la barra superior para gestionar sus tarifas.</div>;
  }

  return (
    <div className="card">
      <div className={styles.flexBetween} style={{ marginBottom: "1rem" }}>
        <h3>Tarifas de la Temporada: {currentSeason.nombre}</h3>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          + Nueva Tarifa
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
         <input 
            type="text" 
            placeholder="Buscar tarifa..." 
            className="input"
            style={{ width: "100%", maxWidth: "400px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-gray-50">
          <h4 className="mb-4">{form.id ? "Editar Tarifa" : "Crear Tarifa"}</h4>
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label className="text-sm">Nombre de Tarifa</label>
              <input required className="input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Infantil 2 días" />
            </div>
            <div style={{ width: "200px" }}>
              <label className="text-sm">Precio Base (€)</label>
              <input required type="number" step="0.01" className="input" value={form.precio_base} onChange={e => setForm({...form, precio_base: e.target.value})} placeholder="0.00" />
            </div>
            <div className="flex items-end gap-2">
              <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader text="Cargando tarifas..." />
      ) : tarifas.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No hay tarifas configuradas para esta temporada.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio Base</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifas.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{Number(t.precio_base).toFixed(2)} €</td>
                  <td className="text-center">
                    <button className={styles.actionBtn} onClick={() => handleOpenForm(t)}>Editar</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RatesTab;
