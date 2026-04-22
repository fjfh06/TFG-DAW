import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cinturonAPI, studentAPI } from "../../services/student.service";
import { userAPI } from "../../services/user.service";
import type { Cinturon, User } from "../../types";
import { toast } from "sonner";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./StudentForm.module.css";

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];
const YEARS = Array.from({ length: 101 }, (_, i) => (new Date().getFullYear() - i).toString());

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [cinturones, setCinturones] = useState<Cinturon[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useLoading(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Para mostrar la foto actual o la previsualización
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [cinturonesData, usersData] = await Promise.all([
          cinturonAPI.getCinturones(),
          userAPI.getUsers()
        ]);
        setCinturones(cinturonesData);
        setUsuarios(usersData);
      } catch {
        toast.error("Error al cargar datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [setIsLoading]);

  // Native Form ref
  const [formValues, setFormValues] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    fecha_nacimiento: "",
    telefono: "",
    direccion: "",
    grado_actual_id: "",
    user_id: "",
    activo: true,
  });

  const [birthParts, setBirthParts] = useState({ d: "", m: "", y: "" });

  useEffect(() => {
    if (isEditing && id) {
      const fetchStudent = async () => {
        try {
          setIsLoading(true);
          const studentData = await studentAPI.getStudent(Number(id));
          const birthDateStr = studentData.fecha_nacimiento ? studentData.fecha_nacimiento.split('T')[0] : "";
          
          setFormValues({
            nombre: studentData.nombre || "",
            apellidos: studentData.apellidos || "",
            dni: studentData.dni || "",
            fecha_nacimiento: birthDateStr,
            telefono: studentData.telefono || "",
            direccion: studentData.direccion || "",
            grado_actual_id: studentData.grado_actual_id?.toString() || "",
            user_id: studentData.user_id?.toString() || "",
            activo: studentData.activo,
          });

          if (birthDateStr) {
            const [y, m, d] = birthDateStr.split('-');
            setBirthParts({ y, m, d });
          }

          setCurrentPhoto(studentData.foto || null);
          setPreviewUrl(null);
        } catch {
          toast.error("Error al cargar datos del alumno");
          navigate("/alumnos");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id, isEditing, navigate, setIsLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Fix empty fields crashes (backend likes None/NULL, not empty strings)
    if (!formValues.fecha_nacimiento) {
      formData.delete("fecha_nacimiento");
    }
    
    if (!formValues.user_id) {
       formData.delete("user_id");
    }

    if (!formValues.grado_actual_id) {
       formData.delete("grado_actual_id");
    }

    if (!formData.get("dni")) {
       formData.delete("dni");
    }
    
    // Convert boolean to string for FormData (backend handles strictly "true"/"false")
    formData.set("activo", formValues.activo ? "true" : "false");

    try {
      if (isEditing && id) {
        await studentAPI.updateStudent(Number(id), formData);
        toast.success("Alumno actualizado correctamente");
      } else {
        await studentAPI.createStudent(formData);
        toast.success("Alumno creado correctamente");
      }
      navigate("/alumnos");
    } catch (error) {
      if(error instanceof Error) {
          toast.error(error.message || "Error al procesar el formulario");
      } else {
          toast.error("Error al procesar el formulario");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDatePartChange = (type: 'd' | 'm' | 'y', value: string) => {
    setBirthParts(prev => {
      const newParts = { ...prev, [type]: value };
      const { d, m, y } = newParts;
      
      // Update formValues.fecha_nacimiento in sync
      if (d && m && y) {
        setFormValues(v => ({ ...v, fecha_nacimiento: `${y}-${m}-${d}` }));
      } else {
        setFormValues(v => ({ ...v, fecha_nacimiento: "" }));
      }
      
      return newParts;
    });
  };

  const getDaysInMonth = (month: string, year: string) => {
    const m = month ? parseInt(month) : 1;
    const y = year ? parseInt(year) : 2024;
    return new Date(y, m, 0).getDate();
  };

  const dynamicDays = Array.from(
    { length: getDaysInMonth(birthParts.m, birthParts.y) }, 
    (_, i) => (i + 1).toString().padStart(2, '0')
  );

  if (isLoading) return <Loader text="Cargando datos..." />;

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>{isEditing ? "Editar Alumno" : "Nuevo Alumno"}</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/alumnos")}>
          Volver al listado
        </button>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formMain}>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Nombre *</label>
              <input required name="nombre" value={formValues.nombre} onChange={handleInputChange} className={styles.inputField} placeholder="Ej. Bruce" />
            </div>
            <div className={styles.formGroup}>
              <label>Apellidos *</label>
              <input required name="apellidos" value={formValues.apellidos} onChange={handleInputChange} className={styles.inputField} placeholder="Ej. Lee" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>DNI</label>
              <input name="dni" value={formValues.dni} onChange={handleInputChange} className={styles.inputField} placeholder="12345678X" />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha Nacimiento</label>
              <div className={styles.dateSelector}>
                <select 
                  className={styles.inputField} 
                  value={birthParts.y} 
                  onChange={(e) => handleDatePartChange('y', e.target.value)}
                >
                  <option value="">Año</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select 
                  className={styles.inputField} 
                  value={birthParts.m} 
                  onChange={(e) => handleDatePartChange('m', e.target.value)}
                >
                  <option value="">Mes</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select 
                  className={styles.inputField} 
                  value={birthParts.d} 
                  onChange={(e) => handleDatePartChange('d', e.target.value)}
                >
                  <option value="">Día</option>
                  {dynamicDays.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input type="hidden" name="fecha_nacimiento" value={formValues.fecha_nacimiento} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Teléfono</label>
              <input name="telefono" value={formValues.telefono} onChange={handleInputChange} className={styles.inputField} placeholder="+34 600 000 000" />
            </div>
            <div className={styles.formGroup}>
              <label>Cinturón Actual</label>
              <select name="grado_actual_id" value={formValues.grado_actual_id} onChange={handleInputChange} className={styles.inputField}>
                <option value="">(Sin asignar)</option>
                {cinturones.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
             <div className={styles.formGroup}>
                <label>Dirección Postal</label>
                <input name="direccion" value={formValues.direccion} onChange={handleInputChange} className={styles.inputField} placeholder="Calle Ejemplo, 123" />
             </div>
          </div>

          <div className={styles.formRow}>
             <div className={styles.formGroup}>
                <label>Vincular a Usuario del Sistema</label>
                <select name="user_id" value={formValues.user_id} onChange={handleInputChange} className={styles.inputField}>
                   <option value="">(Sin vincular)</option>
                   {usuarios.map(u => (
                     <option key={u.id} value={u.id}>{u.username}</option>
                   ))}
                </select>
                <p className="text-xs text-blue-600 font-medium">Tip: vincula esto al usuario con username igual al nombre para coherencia.</p>
             </div>
          </div>

          <div className={styles.checkboxContainer}>
            <input type="checkbox" id="activo" name="activo" checked={formValues.activo} onChange={handleInputChange} />
            <label htmlFor="activo">Alumno Activo (Habilitar acceso y recibos)</label>
          </div>
          
        </div>
        
        <div className={styles.formSidebar}>
           <div className={styles.photoSection}>
             <h4>Fotografía de Perfil</h4>
             <StudentAvatar 
                name={formValues.nombre || "N"} 
                lastName={formValues.apellidos || ""} 
                photoUrl={previewUrl || currentPhoto} 
                size="xl" 
             />
             <div className={styles.fileInputWrapper}>
                <input 
                  type="file" 
                  name="foto" 
                  accept="image/*" 
                  className={styles.fileInput} 
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-3">JPG o PNG. Se reemplazará la actual.</p>
             </div>
           </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "Guardando..." : "Guardar Ficha del Alumno"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
