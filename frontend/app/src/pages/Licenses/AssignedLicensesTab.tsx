import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { licenciaAPI, licenseTypeAPI } from "../../services/license.service";
import { studentAPI } from "../../services/student.service";
import type { LicenciaAlumno, TipoLicencia, Alumno, EstadoPago } from "../../types";
import { useSeason } from "../../hooks/useSeason";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Licenses.module.css";
import { SearchableSelect } from "../../components/common/SearchableSelect/SearchableSelect";

const AssignedLicensesTab = () => {
  const { currentSeason, isLoadingSeasons } = useSeason();
  const [licencias, setLicencias] = useState<LicenciaAlumno[]>([]);
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useLoading(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroParam = searchParams.get('filtro');
  
  const [form, setForm] = useState({
    id: 0,
    alumno_id: "",
    tipo_licencia_id: "",
    estado_pago: "pendiente" as EstadoPago,
    fecha_pago: "",
    fecha_inicio_validez: "",
    fecha_fin_validez: ""
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (currentSeason) {
        const [licenciasData, tiposData, alumnosData] = await Promise.all([
          licenciaAPI.getLicencias(undefined, currentSeason.id),
          licenseTypeAPI.getTipos(currentSeason.id),
          studentAPI.getStudents()
        ]);
        setLicencias(licenciasData);
        setAlumnos(alumnosData);
        setTipos(tiposData);
      } else {
        setLicencias([]);
        setTipos([]);
      }
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingSeasons) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeason, isLoadingSeasons]);

  const handleOpenForm = (l?: LicenciaAlumno) => {
    if (l) {
      setForm({
        id: l.id,
        alumno_id: l.alumno_id.toString(),
        tipo_licencia_id: l.tipo_licencia_id.toString(),
        estado_pago: l.estado_pago,
        fecha_pago: l.fecha_pago ? l.fecha_pago.split('T')[0] : "",
        fecha_inicio_validez: l.fecha_inicio_validez ? l.fecha_inicio_validez.split('T')[0] : "",
        fecha_fin_validez: l.fecha_fin_validez ? l.fecha_fin_validez.split('T')[0] : ""
      });
    } else {
      // Auto-calculate [Nov 1st - Oct 31st]
      const today = new Date();
      let year = today.getFullYear();
      if (today.getMonth() < 10) { year -= 1; }

      const d_inicio = `${year}-11-01`;
      const d_fin = `${year+1}-10-31`;
      const todayStr = new Date().toISOString().split('T')[0];

      setForm({
        id: 0, alumno_id: "", tipo_licencia_id: "",
        estado_pago: "pendiente", fecha_pago: todayStr,
        fecha_inicio_validez: d_inicio, fecha_fin_validez: d_fin
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        alumno_id: Number(form.alumno_id),
        tipo_licencia_id: Number(form.tipo_licencia_id),
        estado_pago: form.estado_pago,
        fecha_pago: form.estado_pago !== "pendiente" && form.fecha_pago ? form.fecha_pago : undefined,
        fecha_inicio_validez: form.fecha_inicio_validez || undefined,
        fecha_fin_validez: form.fecha_fin_validez || undefined
      };

      if (form.id) {
        await licenciaAPI.updateLicencia(form.id, payload);
        toast.success("Asignación actualizada");
      } else {
        // Enforce only one per student?
        await licenciaAPI.createLicencia(payload);
        toast.success("Licencia asignada exitosamente");
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
       if (error instanceof Error) {
         toast.error(error.message);
       } else {
         toast.error("Error al procesar la licencia");
       }
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Seguro que deseas desvincular esta licencia del alumno?")) return;
    try {
      await licenciaAPI.deleteLicencia(id);
      toast.success("Licencia desvinculada");
      fetchData();
    } catch {
      toast.error("No se pudo desvincular la licencia");
    }
  };

  const getStudentName = (id: number) => {
    const s = alumnos.find(a => a.id === id);
    return s ? `${s.nombre} ${s.apellidos}` : id;
  };

  const getTipoName = (id: number) => {
    const t = tipos.find(x => x.id === id);
    return t ? t.nombre : id;
  };

  const getStatusClass = (estado: string) => {
    if (estado === "pagado") return styles.badgeSuccess;
    if (estado === "pendiente") return styles.badgeDanger;
    return styles.badgeWarning;
  };

  const dMy = (d: string | null | undefined) => {
      if(!d) return "-";
      return new Date(d).toLocaleDateString('es');
  };

  return (
    <div className="card">
      <div className={styles.flexBetween}>
        <h3>Licencias de Alumnos</h3>
        <div className="flex gap-2">
           {filtroParam === 'sin_licencia' && (
              <button className="btn btn-secondary bg-amber-50 text-amber-600 border-amber-200" onClick={() => setSearchParams({})}>
                ❌ Quitar Filtro Sin Licencia
              </button>
           )}
           <button className="btn btn-primary" onClick={() => handleOpenForm()}>
             + Asignar Licencia
           </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-gray-50 border-gray-200">
          <h4 className="mb-4">{form.id ? "Editar Asignación" : "Asignar Licencia"}</h4>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div style={{ flex: '1 1 200px' }}>
              <label className="text-sm">Alumno *</label>
              <SearchableSelect
                 options={alumnos.map(a => ({
                    id: a.id,
                    label: `${a.nombre} ${a.apellidos}`,
                    sublabel: a.dni || undefined,
                    image: a.foto
                 }))}
                 value={form.alumno_id}
                 onChange={(id) => setForm({...form, alumno_id: id.toString()})}
                 placeholder="Buscar alumno..."
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="text-sm">Tipo de Licencia *</label>
              <select required className="input" value={form.tipo_licencia_id} onChange={e => setForm({...form, tipo_licencia_id: e.target.value})}>
                <option value="">Seleccione el tipo...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div style={{ flex: 1 }}>
              <label className="text-sm">Estado del Pago *</label>
              <select required className="input" value={form.estado_pago} onChange={e => setForm({...form, estado_pago: e.target.value as EstadoPago})}>
                <option value="pagado">Pagado Total</option>
                <option value="parcial">Pago Parcial</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-sm">Fecha de Pago</label>
              <input type="date" className="input" value={form.fecha_pago} onChange={e => setForm({...form, fecha_pago: e.target.value})} disabled={form.estado_pago === 'pendiente'} />
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4 bg-gray-100 p-3 rounded">
            ℹ️ <strong>Información:</strong> La validez oficial de las licencias se fija automáticamente desde el <strong>1 de Noviembre</strong> al <strong>31 de Octubre</strong> de la temporada en curso.
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Asignación</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader text="Cargando licencias..." />
      ) : filtroParam === 'sin_licencia' ? (
        <div className={styles.tableContainer}>
          <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-3">
             <span className="text-2xl">🛡️</span>
             <div>
               <h4 className="text-amber-800 font-bold mb-0">Alumnos Activos Sin Licencia Federativa</h4>
               <p className="text-sm text-amber-600 mb-0">Estos alumnos no tienen ninguna licencia vinculada en la temporada actual.</p>
             </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Alumno DNI / Nombre</th>
                <th>Estado Actual</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.filter(a => a.activo && !licencias.some(l => l.alumno_id === a.id)).length === 0 ? (
                <tr><td colSpan={3} className="text-center text-gray-500 py-4">Todos los alumnos activos tienen licencia.</td></tr>
              ) : (
                alumnos.filter(a => a.activo && !licencias.some(l => l.alumno_id === a.id)).map(alumno => {
                  return (
                    <tr key={alumno.id} className="bg-amber-50/30">
                      <td className="font-medium">{alumno.nombre} {alumno.apellidos} {alumno.dni ? `(${alumno.dni})` : ''}</td>
                      <td>
                         <span className="text-amber-600 font-medium">No Federado</span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-primary text-xs py-1 px-3 bg-amber-600 hover:bg-amber-700 border-none" onClick={() => {
                            setForm(f => ({...f, alumno_id: alumno.id.toString()}));
                            setIsFormOpen(true);
                        }}>Federar</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : licencias.length === 0 ? (
        <div className="py-4 text-center text-gray-500">No hay licencias vinculadas a ningún alumno.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Tipo de Licencia</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Validez</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {licencias.map(l => (
                <tr key={l.id}>
                  <td className="font-medium">{getStudentName(l.alumno_id)}</td>
                  <td>{getTipoName(l.tipo_licencia_id)}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusClass(l.estado_pago)}`}>
                        {l.estado_pago}
                    </span>
                  </td>
                  <td className="text-gray-600 text-sm whitespace-nowrap">{dMy(l.fecha_pago)}</td>
                  <td className="text-gray-600 text-sm whitespace-nowrap">
                    {dMy(l.fecha_inicio_validez)} <br />a<br /> {dMy(l.fecha_fin_validez)}
                  </td>
                  <td className="text-center">
                    <button className={styles.actionBtn} onClick={() => handleOpenForm(l)}>Editar</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(l.id)}>Borrar</button>
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

export default AssignedLicensesTab;
