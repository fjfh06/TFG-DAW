import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentAPI } from "../../services/student.service";
import type { Alumno } from "../../types";
import { StudentAvatar } from "../../components/common/StudentAvatar/StudentAvatar";
import { toast } from "sonner";
import styles from "./Students.module.css";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";

const Students = () => {
  const [students, setStudents] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useLoading(true);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentAPI.getStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Error al cargar los alumnos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar a este alumno?")) return;
    try {
      await studentAPI.deleteStudent(id);
      toast.success("Alumno eliminado correctamente");
      fetchStudents();
    } catch (error) {
      toast.error("Error al eliminar alumno");
      console.error(error);
    }
  };

  return (
    <div className={styles.studentsContainer}>
      <div className={styles.header}>
        <div>
          <h2>Gestión de Alumnos</h2>
          <p className="text-gray-600">Administra los practicantes del club.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/alumnos/nuevo")}
        >
          + Nuevo Alumno
        </button>
      </div>

      <div className={`card ${styles.tableCard}`}>
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="premiumSearchContainer" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellidos o DNI..." 
              className="premiumSearchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="premiumSearchIcon">🔍</span>
          </div>
        </div>
        {isLoading ? (
          <Loader text="Cargando alumnos..." />
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-bold">No hay alumnos registrados.</div>
        ) : (
          <div className="tableWrapper">
            <table className="premiumTable">
              <thead>
                <tr>
                  <th className="sticky-col">Alumno</th>
                  <th>DNI</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(student => 
                    `${student.nombre} ${student.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (student.dni && student.dni.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((student) => (
                  <tr key={student.id}>
                    <td className="sticky-col">
                      <div className={styles.studentInfoCell}>
                        <StudentAvatar photoUrl={student.foto} name={student.nombre} lastName={student.apellidos} size="sm" />
                        <div className={styles.studentName}>
                          {student.nombre} {student.apellidos}
                        </div>
                      </div>
                    </td>
                    <td>{student.dni || "-"}</td>
                    <td>{student.telefono || "-"}</td>
                    <td>
                      <span className={`badge ${student.activo ? 'badge-success' : 'badge-danger'}`}>
                        {student.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-action"
                          onClick={() => navigate(`/alumnos/${student.id}`)}
                          title="Ver Ficha"
                        >
                          Ficha
                        </button>
                        <button 
                          className="btn-action"
                          onClick={() => navigate(`/alumnos/editar/${student.id}`)}
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-action-danger"
                          onClick={() => handleDelete(student.id)}
                          title="Eliminar"
                        >
                          Borrar
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
    </div>
  );
};

export default Students;
