import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { pagoAPI, tarifaAPI } from "../../services/payment.service";
import { studentAPI } from "../../services/student.service";
import type { PagoMensualidad, EstadoPago, Alumno, TarifaMensual } from "../../types";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Payments.module.css";
import { useSeason } from "../../hooks/useSeason";
import { SearchableSelect } from "../../components/common/SearchableSelect/SearchableSelect";
import { Edit3, Trash2 } from "lucide-react";

const ReceiptsTab = () => {
  const { currentSeason } = useSeason();
  const [pagos, setPagos] = useState<PagoMensualidad[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [tarifas, setTarifas] = useState<TarifaMensual[]>([]);
  const [isLoading, setIsLoading] = useLoading(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroParam = searchParams.get('filtro');
  
  // Filtros
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [filterMes, setFilterMes] = useState(currentMonth);
  const [filterAnio, setFilterAnio] = useState(currentYear);

  // Formulario de emisión de recibo
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    alumno_id: "",
    mes: currentMonth.toString(),
    anio: currentYear.toString(),
    tarifa_aplicada_id: "",
    cantidad: "",
    estado: "pagado" as EstadoPago,
    observaciones: "",
    fecha_pago: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pagosData, alumnosData, tarifasData] = await Promise.all([
        pagoAPI.getPagos(undefined, filterMes, filterAnio),
        studentAPI.getStudents(),
        tarifaAPI.getTarifas()
      ]);
      setPagos(pagosData);
      setAlumnos(alumnosData);
      
      if (currentSeason) {
          setTarifas(tarifasData.filter(t => t.temporada_id === currentSeason.id));
      } else {
          setTarifas(tarifasData);
      }
    } catch {
      toast.error("Error al cargar los recibos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSeason) {
      const start = new Date(currentSeason.fecha_inicio);
      const end = new Date(currentSeason.fecha_fin);
      const currentDate = new Date(filterAnio, filterMes - 1, 1);
      
      // Si la fecha seleccionada está fuera de temporada, ajustarla
      if (currentDate < new Date(start.getFullYear(), start.getMonth(), 1)) {
         setFilterMes(start.getMonth() + 1);
         setFilterAnio(start.getFullYear());
      } else if (currentDate > new Date(end.getFullYear(), end.getMonth(), 1)) {
         setFilterMes(end.getMonth() + 1);
         setFilterAnio(end.getFullYear());
      }
    }
  }, [currentSeason]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMes, filterAnio, currentSeason]);

  const handleOpenForm = (p?: PagoMensualidad) => {
    if (p) {
      setForm({
        id: p.id,
        alumno_id: p.alumno_id.toString(),
        mes: p.mes.toString(),
        anio: p.anio.toString(),
        tarifa_aplicada_id: p.tarifa_aplicada_id?.toString() || "",
        cantidad: p.cantidad.toString(),
        estado: p.estado,
        observaciones: p.observaciones || "",
        fecha_pago: p.fecha_pago || new Date().toISOString().split('T')[0]
      });
    } else {
      setForm({
        id: 0,
        alumno_id: "",
        mes: filterMes.toString(),
        anio: filterAnio.toString(),
        tarifa_aplicada_id: "",
        cantidad: "",
        estado: "pagado",
        observaciones: "",
        fecha_pago: new Date().toISOString().split('T')[0]
      });
    }
    setIsFormOpen(true);
  };

  // Autocompletar cantidad al cambiar la tarifa
  useEffect(() => {
    if (form.tarifa_aplicada_id && form.id === 0) { // Solo si es nuevo
      const tarifa = tarifas.find(t => t.id.toString() === form.tarifa_aplicada_id);
      if (tarifa) {
        setForm(f => ({ ...f, cantidad: tarifa.precio_base.toString() }));
      }
    }
  }, [form.tarifa_aplicada_id, form.id, tarifas]);

  // Intentar pre-seleccionar la tarifa basada en el historial del alumno
  useEffect(() => {
    if (form.id !== 0 || !form.alumno_id) return;

    const fetchLastPayment = async () => {
      try {
        const payments = await pagoAPI.getPagos(Number(form.alumno_id));
        if (payments.length > 0) {
          // Cogemos el más reciente (por ID descendente)
          const last = [...payments].sort((a, b) => b.id - a.id)[0];
          setForm(f => ({
            ...f,
            tarifa_aplicada_id: last.tarifa_aplicada_id?.toString() || "",
            cantidad: last.cantidad.toString()
          }));
        } else if (tarifas.length > 0) {
          // Si no hay historial, usar la primera tarifa de la temporada actual
          const defaultTarifa = tarifas.find(t => currentSeason && t.temporada_id === currentSeason.id) || tarifas[0];
          setForm(f => ({
            ...f,
            tarifa_aplicada_id: defaultTarifa.id.toString(),
            cantidad: defaultTarifa.precio_base.toString()
          }));
        }
      } catch (e) {
        console.error("Error al obtener el último pago del alumno:", e);
      }
    };
    
    fetchLastPayment();
  }, [form.alumno_id, form.id, tarifas, currentSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        alumno_id: Number(form.alumno_id),
        mes: Number(form.mes),
        anio: Number(form.anio),
        tarifa_aplicada_id: form.tarifa_aplicada_id ? Number(form.tarifa_aplicada_id) : undefined,
        cantidad: Number(form.cantidad),
        estado: form.estado,
        observaciones: form.observaciones,
        fecha_pago: form.estado === 'pagado' || form.estado === 'parcial' ? form.fecha_pago : undefined
      };

      if (form.id) {
        await pagoAPI.updatePago(form.id, payload);
        toast.success("Recibo actualizado");
      } else {
        await pagoAPI.createPago(payload);
        toast.success("Recibo emitido");
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      if(error instanceof Error) {
          toast.error(error.message);
      } else {
          toast.error("Error al procesar el recibo");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este recibo?")) return;
    try {
      await pagoAPI.deletePago(id);
      toast.success("Recibo eliminado");
      fetchData();
    } catch {
      toast.error("Error al eliminar recibo");
    }
  };

  const getStudentName = (id: number) => {
    const s = alumnos.find(a => a.id === id);
    return s ? `${s.nombre} ${s.apellidos}` : id;
  };

  const statusColor = (estado: string) => {
    if (estado === 'pagado') return styles.badgeSuccess;
    if (estado === 'pendiente') return styles.badgeDanger;
    return styles.badgeWarning;
  };

  return (
    <div className="card">
      <div className={styles.flexBetween}>
        <h3>Listado de Recibos Mensuales</h3>
        <div className="flex gap-2">
           {filtroParam === 'pendientes' && (
              <button className="btn btn-secondary bg-red-50 text-red-600 border-red-200" onClick={() => setSearchParams({})}>
                ❌ Quitar Filtro
              </button>
           )}
           <button className="btn btn-primary" onClick={() => handleOpenForm()}>
             + Emitir Recibo
           </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm">Mes:</label>
          <select className="input" value={filterMes} onChange={e => setFilterMes(Number(e.target.value))} style={{ width: 120 }}>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('es', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm">Año:</label>
          <input type="number" className="input" value={filterAnio} onChange={e => setFilterAnio(Number(e.target.value))} style={{ width: 100 }} />
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="formGlass mb-8 animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-xl font-black mb-6">{form.id ? "Editar Recibo" : "Emitir Nuevo Recibo"}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Alumno *</label>
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
            
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Tarifa a aplicar</label>
              <select className="inputField" value={form.tarifa_aplicada_id} onChange={e => setForm({...form, tarifa_aplicada_id: e.target.value})}>
                <option value="">Tarifa personalizada...</option>
                {tarifas.map(t => <option key={t.id} value={t.id}>{t.nombre} ({Number(t.precio_base)}€)</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Mes *</label>
              <select required className="inputField" value={form.mes} onChange={e => setForm({...form, mes: e.target.value})}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('es', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Año *</label>
              <input required type="number" className="inputField" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Cantidad Cobrada (€) *</label>
              <input required type="number" step="0.01" className="inputField" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} />
            </div>

            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Estado *</label>
              <select required className="inputField" value={form.estado} onChange={e => setForm({...form, estado: e.target.value as EstadoPago})}>
                <option value="pagado">Pagado Total</option>
                <option value="parcial">Pago Parcial</option>
                <option value="pendiente">Pendiente (Deuda)</option>
              </select>
            </div>
            
            <div className="formGroup">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Fecha de Pago</label>
              <input type="date" className="inputField" value={form.fecha_pago} onChange={e => setForm({...form, fecha_pago: e.target.value})} />
            </div>
          </div>

          <div className="formGroup mb-8">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Observaciones</label>
            <input type="text" className="inputField" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Ej: Faltan 10€, pagó en efectivo..." />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Recibo</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader text="Cargando recibos..." />
      ) : filtroParam === 'pendientes' ? (
        <div className={styles.tableContainer}>
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
             <span className="text-2xl">⚠️</span>
             <div>
               <h4 className="text-red-800 font-bold mb-0">Alumnos Activos con Mensualidad Pendiente</h4>
               <p className="text-sm text-red-600 mb-0">Estos alumnos no tienen un recibo pagado para {filterMes}/{filterAnio}.</p>
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
              {alumnos.filter(a => a.activo && !pagos.some(p => p.alumno_id === a.id && p.estado === 'pagado')).length === 0 ? (
                <tr><td colSpan={3} className="text-center text-gray-500 py-4">No hay deudores para este mes.</td></tr>
              ) : (
                alumnos.filter(a => a.activo && !pagos.some(p => p.alumno_id === a.id && p.estado === 'pagado')).map(alumno => {
                  const reciboPdte = pagos.find(p => p.alumno_id === alumno.id);
                  return (
                    <tr key={alumno.id} className="bg-red-50/30">
                      <td className="font-medium">{alumno.nombre} {alumno.apellidos} {alumno.dni ? `(${alumno.dni})` : ''}</td>
                      <td>
                        {reciboPdte ? (
                          <span className={`${styles.badge} ${styles.badgeDanger}`}>{reciboPdte.estado} (Registrado)</span>
                        ) : (
                          <span className="text-red-500 font-medium">Sin recibo este mes</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-primary text-xs py-1 px-3" onClick={() => {
                          if (reciboPdte) handleOpenForm(reciboPdte);
                          else {
                            setForm(f => ({...f, alumno_id: alumno.id.toString()}));
                            setIsFormOpen(true);
                          }
                        }}>Regularizar</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No hay recibos registrados en este mes.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Fecha Pago</th>
                <th>Observaciones</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{getStudentName(p.alumno_id)}</td>
                  <td>
                    <span className={`${styles.badge} ${statusColor(p.estado)}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="font-medium">{Number(p.cantidad).toFixed(2)} €</td>
                  <td className="text-gray-600 text-sm">{p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : '-'}</td>
                  <td className="text-gray-500 text-sm">{p.observaciones || '-'}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button className={styles.actionBtn} onClick={() => handleOpenForm(p)} title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} title="Borrar">
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

export default ReceiptsTab;
