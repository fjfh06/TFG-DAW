import { useState, useEffect } from "react";
import { userAPI } from "../../services/user.service";
import type { User, Role } from "../../types";
import { toast } from "sonner";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Settings.module.css";
import { useAuth } from "../../hooks/useAuth";
import { formatRole } from "../../utils/formatters";
import { Edit3, Trash2, Search } from "lucide-react";

const UsersTab = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useLoading(false);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: 0, username: '', password: '', rol: 'user' as Role });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getUsers();
      // Mapear devuelta el array (por si Flask devuelve "roles" en vez de "rol")
      const mapped = data.map((u: User & { roles?: string }) => ({
          ...u,
          rol: (u.roles || u.rol || 'user') as Role
      }));
      setUsers(mapped);
    } catch {
      toast.error("Error al cargar configuración de usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.username) {
        toast.error("El nombre de usuario es obligatorio");
        return;
    }

    try {
      const payload: Partial<User> & { roles?: string; password?: string } = { username: formData.username, roles: formData.rol };
      if (formData.password) {
          payload.password = formData.password;
      }

      if (formData.id) {
        await userAPI.updateUser(formData.id, payload);
        toast.success("Usuario actualizado");
      } else {
        if (!formData.password) {
            toast.error("La contraseña es obligatoria para nuevos usuarios");
            return;
        }
        await userAPI.createUser(payload);
        toast.success("Usuario creado");
      }
      setShowForm(false);
      setFormData({ id: 0, username: '', password: '', rol: 'user' as Role });
      fetchData();
    } catch (e) {
      toast.error((e as Error).message || "Error al guardar usuario");
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
        toast.error("No puedes eliminarte a ti mismo");
        return;
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este acceso?")) return;
    try {
      await userAPI.deleteUser(id);
      toast.success("Usuario eliminado");
      fetchData();
    } catch {
      toast.error("No se pudo eliminar el usuario");
    }
  };

  if (isLoading) return <Loader text="Cargando usuarios..." />;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    formatRole(u.rol).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Accesos y Usuarios</h3>
        <button className="btn btn-primary" onClick={() => {
            setFormData({ id: 0, username: '', password: '', rol: 'user' as Role });
            setShowForm(true);
        }}>+ Añadir Usuario</button>
      </div>

      <div className="premiumSearchContainer">
        <input 
          type="text" 
          placeholder="Buscar usuario o rol..." 
          className="premiumSearchInput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="premiumSearchIcon"><Search size={20} className="text-gray-400" /></span>
      </div>

      {showForm && (
        <form className="formGlass mb-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <h4 className="text-xl font-black mb-6">{formData.id ? "Editar Acceso" : "Nuevo Acceso"}</h4>
          <div className="formRow">
            <div className="formGroup">
              <label>Nombre de Usuario</label>
              <input 
                type="text" 
                className="inputField"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                placeholder="Ej. fjavier" 
                required
              />
            </div>
            <div className="formGroup">
              <label>{formData.id ? "Nueva Contraseña (Vacio = No cambiar)" : "Contraseña *"}</label>
              <input 
                type="password" 
                className="inputField"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••••"
                required={!formData.id}
              />
            </div>
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label>Rol del Sistema</label>
              <select 
                value={formData.rol} 
                onChange={e => setFormData({...formData, rol: e.target.value as Role})}
                className="inputField"
                required
              >
                <option value="admin">Administrador (Total)</option>
                <option value="ayudante">Ayudante (Restringido)</option>
                <option value="user">Usuario Básico (Alumnos)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader text="Cargando usuarios..." />
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 text-center text-gray-400 font-bold">No se encontraron usuarios.</div>
      ) : (
        <div className="tableWrapper" style={{ maxWidth: '500px' }}>
          <table className="premiumTable" style={{ minWidth: 'auto' }}>
            <thead>
              <tr>
                <th className="sticky-col">Username</th>
                <th>Rol (Permisos)</th>
                <th className="text-right" style={{ width: '1%', whiteSpace: 'nowrap' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td className="sticky-col font-bold">{u.username}</td>
                  <td>
                      <span className={`badge ${
                          u.rol === 'admin' ? 'badge-success' : 
                          u.rol === 'ayudante' ? 'badge-warning' : 
                          'badge-danger'
                      }`}>
                          {formatRole(u.rol)}
                      </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button className={styles.actionBtn} onClick={() => {
                          setFormData({ id: u.id, username: u.username, password: '', rol: u.rol });
                          setShowForm(true);
                      }} title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === currentUser?.id}
                        title="Borrar"
                      >
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

export default UsersTab;
