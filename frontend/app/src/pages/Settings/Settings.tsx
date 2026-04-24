import { useState, useEffect } from "react";
import { seasonAPI } from "../../services/season.service";
import { cinturonAPI } from "../../services/student.service";
import type { Temporada, Cinturon } from "../../types";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import UsersTab from "./UsersTab";
import styles from "./Settings.module.css";

const Settings = () => {
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [cinturones, setCinturones] = useState<Cinturon[]>([]);
  const [isLoading, setIsLoading] = useLoading(true);
  const [activeTab, setActiveTab] = useState<'temporadas' | 'cinturones' | 'usuarios'>('temporadas');

  // Form states
  const [showTemporadaForm, setShowTemporadaForm] = useState(false);
  const [tempFormData, setTempFormData] = useState({ id: 0, nombre: '', fecha_inicio: '', fecha_fin: '', activa: false });
  
  const [showCinturonForm, setShowCinturonForm] = useState(false);
  const [cinturonFormData, setCinturonFormData] = useState({ id: 0, nombre: '', orden_jerarquia: 1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [t, c] = await Promise.all([
        seasonAPI.getTemporadas(),
        cinturonAPI.getCinturones()
      ]);
      setTemporadas(t);
      setCinturones(c);
    } catch {
      toast.error("Error al cargar configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const isTemporadaActiva = (inicio: string, fin: string) => {
    if (!inicio || !fin) return false;
    const hoy = new Date().toISOString().split('T')[0];
    const inicioStr = inicio.split('T')[0];
    const finStr = fin.split('T')[0];
    return hoy >= inicioStr && hoy <= finStr;
  };

  // --- TEMPORADAS ---
  const handleSaveTemporada = async () => {
    try {
      const { id, ...dataToSave } = tempFormData;

      if (id) {
        await seasonAPI.updateTemporada(id, dataToSave);
      } else {
        await seasonAPI.createTemporada(dataToSave);
      }

      setShowTemporadaForm(false);
      setTempFormData({ id: 0, nombre: '', fecha_inicio: '', fecha_fin: '', activa: false });
      
      toast.success(id ? "Temporada actualizada" : "Temporada creada");
      
      // Recargamos la web para que los cambios de temporada surtan efecto en toda la app
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast.error("Error al guardar temporada");
    }
  };

  const handleDeleteTemporada = async (id: number) => {
    if(!confirm("¿Eliminar esta temporada?")) return;
    try {
      await seasonAPI.deleteTemporada(id);
      toast.success("Temporada eliminada");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast.error("Error al eliminar (puede tener dependencias)");
    }
  };

  // --- CINTURONES ---
  const handleSaveCinturon = async () => {
    try {
      if (cinturonFormData.id) {
        await cinturonAPI.updateCinturon(cinturonFormData.id, cinturonFormData);
        toast.success("Cinturón actualizado");
      } else {
        await cinturonAPI.createCinturon(cinturonFormData);
        toast.success("Cinturón creado");
      }
      setShowCinturonForm(false);
      setCinturonFormData({ id: 0, nombre: '', orden_jerarquia: 1 });
      fetchData();
    } catch {
      toast.error("Error al guardar cinturón");
    }
  };

  const handleDeleteCinturon = async (id: number) => {
    if(!confirm("¿Eliminar este cinturón?")) return;
    try {
      await cinturonAPI.deleteCinturon(id);
      toast.success("Cinturón eliminado");
      fetchData();
    } catch {
      toast.error("Error al eliminar (puede tener alumnos asociados)");
    }
  };

  if (isLoading) return <Loader text="Cargando configuración..." />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Configuración</h2>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'temporadas' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('temporadas')}
          >
            Temporadas
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'cinturones' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cinturones')}
          >
            Cinturones
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'usuarios' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Usuarios y Accesos
          </button>
        </div>
      </div>

      {/* BLOQUE TEMPORADAS */}
      {activeTab === 'temporadas' && (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Gestión de Temporadas</h3>
          <button className="btn btn-primary" onClick={() => {
            setTempFormData({ id: 0, nombre: '', fecha_inicio: '', fecha_fin: '', activa: false });
            setShowTemporadaForm(!showTemporadaForm);
          }}>+ Añadir Temporada</button>
        </div>

        {showTemporadaForm && (
          <div className="formGlass mb-8 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-xl font-black mb-6">{tempFormData.id ? "Editar Temporada" : "Nueva Temporada"}</h4>
            <div className="formRow">
              <div className="formGroup">
                <label>Nombre de la Temporada</label>
                <input type="text" className="inputField" value={tempFormData.nombre} onChange={e => setTempFormData({...tempFormData, nombre: e.target.value})} placeholder="Ej. 2025/2026" />
              </div>
            </div>
            <div className="formRow">
              <div className="formGroup">
                <label>Fecha Inicio</label>
                <input type="date" className="inputField" value={tempFormData.fecha_inicio} onChange={e => setTempFormData({...tempFormData, fecha_inicio: e.target.value})} />
              </div>
              <div className="formGroup">
                <label>Fecha Fin</label>
                <input type="date" className="inputField" value={tempFormData.fecha_fin} onChange={e => setTempFormData({...tempFormData, fecha_fin: e.target.value})} />
              </div>
            </div>
            <div className="formRow">
              <div className="formGroup">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tempFormData.activa} 
                    onChange={e => setTempFormData({...tempFormData, activa: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Temporada Activa (Esta temporada se usará para nuevas inscripciones y filtros por defecto)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <button className="btn btn-secondary" onClick={() => setShowTemporadaForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveTemporada}>Guardar</button>
            </div>
          </div>
        )}

        <div className="tableWrapper">
          <table className="premiumTable">
            <thead>
              <tr>
                <th className="sticky-col">Nombre</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th className="text-right" style={{ width: '1%', whiteSpace: 'nowrap' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {temporadas.map(t => (
                <tr key={t.id}>
                  <td className="sticky-col font-bold">{t.nombre}</td>
                  <td>{t.fecha_inicio ? t.fecha_inicio.split('T')[0] : ''}</td>
                  <td>{t.fecha_fin ? t.fecha_fin.split('T')[0] : ''}</td>
                  <td>
                    {/* {t.activa && <span className="badge badge-success mr-2">Activa</span>} */}
                    {isTemporadaActiva(t.fecha_inicio, t.fecha_fin) && <span className="badge badge-info">Temporada Actual</span>}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            setTempFormData({ id: t.id, nombre: t.nombre, fecha_inicio: t.fecha_inicio.split('T')[0], fecha_fin: t.fecha_fin? t.fecha_fin.split('T')[0] : '', activa: t.activa });
                            setShowTemporadaForm(true);
                        }}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTemporada(t.id)}>Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* BLOQUE CINTURONES */}
      {activeTab === 'cinturones' && (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Gestión de Cinturones</h3>
          <button className="btn btn-primary" onClick={() => {
            setCinturonFormData({ id: 0, nombre: '', orden_jerarquia: cinturones.length + 1 });
            setShowCinturonForm(!showCinturonForm);
          }}>+ Añadir Cinturón</button>
        </div>

        {showCinturonForm && (
          <div className="formGlass mb-8 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-xl font-black mb-6">{cinturonFormData.id ? "Editar Cinturón" : "Nuevo Cinturón"}</h4>
            <div className="formRow">
              <div className="formGroup">
                <label>Color (Nombre)</label>
                <input type="text" className="inputField" value={cinturonFormData.nombre} onChange={e => setCinturonFormData({...cinturonFormData, nombre: e.target.value})} placeholder="Ej. Blanco" />
              </div>
              <div className="formGroup">
                <label>Orden Jerárquico</label>
                <input type="number" className="inputField" value={cinturonFormData.orden_jerarquia} onChange={e => setCinturonFormData({...cinturonFormData, orden_jerarquia: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <button className="btn btn-secondary" onClick={() => setShowCinturonForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveCinturon}>Guardar</button>
            </div>
          </div>
        )}

        <div className="tableWrapper">
          <table className="premiumTable">
            <thead>
              <tr>
                <th className="sticky-col">Orden</th>
                <th>Color</th>
                <th className="text-right" style={{ width: '1%', whiteSpace: 'nowrap' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cinturones.map(c => (
                <tr key={c.id}>
                  <td className="sticky-col">{c.orden_jerarquia}</td>
                  <td className="font-bold">{c.nombre}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            setCinturonFormData({ id: c.id, nombre: c.nombre, orden_jerarquia: c.orden_jerarquia });
                            setShowCinturonForm(true);
                        }}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCinturon(c.id)}>Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* BLOQUE USUARIOS */}
      {activeTab === 'usuarios' && <UsersTab />}
    </div>
  );
};

export default Settings;
