import { useState, useEffect } from "react";
import { licenseTypeAPI } from "../../services/license.service";
import type { TipoLicencia } from "../../types";
import { useSeason } from "../../hooks/useSeason";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Licenses.module.css";
import { Edit3, Trash2 } from "lucide-react";

const LicenseTypesTab = () => {
  const { currentSeason, isLoadingSeasons } = useSeason();
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useLoading(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, nombre: "", precio: "" });

  const fetchTipos = async () => {
    try {
      setIsLoading(true);
      const data = await licenseTypeAPI.getTipos();
      if (currentSeason) {
        setTipos(data.filter(t => t.temporada_id === currentSeason.id));
      } else {
        setTipos([]);
      }
    } catch {
      toast.error("Error al cargar los tipos de licencia");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingSeasons) fetchTipos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeason, isLoadingSeasons]);

  const handleOpenForm = (t?: TipoLicencia) => {
    if (t) {
      setForm({ id: t.id, nombre: t.nombre, precio: t.precio.toString() });
    } else {
      setForm({ id: 0, nombre: "", precio: "" });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeason) return toast.error("No hay temporada activa seleccionada.");

    try {
      const payload = {
        nombre: form.nombre,
        precio: Number(form.precio),
        temporada_id: currentSeason.id
      };

      if (form.id) {
        await licenseTypeAPI.updateTipo(form.id, payload);
        toast.success("Tipo de licencia actualizado");
      } else {
        await licenseTypeAPI.createTipo(payload);
        toast.success("Tipo de licencia creado");
      }
      setIsFormOpen(false);
      fetchTipos();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al procesar el tipo de licencia");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este tipo de licencia? No debe tener alumnos vinculados.")) return;
    try {
      await licenseTypeAPI.deleteTipo(id);
      toast.success("Tipo de licencia eliminado");
      fetchTipos();
    } catch {
      toast.error("Error al eliminar (puede tener asignaciones).");
    }
  };

  if (!currentSeason) {
    return <div className="text-gray-500 py-4">Seleccione una temporada en la barra superior.</div>;
  }

  return (
    <div className="card">
      <div className={styles.flexBetween} style={{ marginBottom: "1rem" }}>
        <h3>Catálogo de Licencias Federativas</h3>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          + Nuevo Tipo
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
         <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            className="input"
            style={{ width: "100%", maxWidth: "400px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="formGlass mb-8 animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-xl font-black mb-6">{form.id ? "Editar Tipo" : "Crear Tipo"}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Nombre de la Licencia</label>
              <input required className="inputField" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Kung-Fu Infantil" />
            </div>
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Precio (€)</label>
              <input required type="number" step="0.01" className="inputField" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader text="Cargando tipos de licencia..." />
      ) : tipos.length === 0 ? (
        <div className="py-4 text-center text-gray-500">No hay configuradas para esta temporada.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                <tr key={t.id}>
                  <td className="font-medium">{t.nombre}</td>
                  <td>{Number(t.precio).toFixed(2)} €</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button className={styles.actionBtn} onClick={() => handleOpenForm(t)} title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)} title="Borrar">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default LicenseTypesTab;
