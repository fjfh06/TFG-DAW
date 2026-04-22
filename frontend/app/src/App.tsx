import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthProvider';
import { SeasonProvider } from './context/SeasonProvider';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';

import Login from './pages/Login/Login';
import Students from './pages/Students/Students';
import StudentForm from './pages/Students/StudentForm';
import StudentProfile from './pages/Students/StudentProfile';
import Payments from './pages/Payments/Payments';
import Attendance from './pages/Attendance/Attendance';
import Licenses from './pages/Licenses/Licenses';
import Events from './pages/Events/Events';
import Settings from './pages/Settings/Settings';

const NotFound = () => (
  <div className="container mt-4 text-center">
    <h2>404 - Página no encontrada</h2>
    <p>La ruta a la que intentas acceder no existe.</p>
  </div>
);

// Vistas temporales para probar el router

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas bajo el MainLayout */}
        <Route element={<ProtectedRoute><SeasonProvider><MainLayout /></SeasonProvider></ProtectedRoute>}>
          {/* Accesible para todos los logueados */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Accesible para admin y ayudante */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'ayudante']}><Outlet /></ProtectedRoute>}>
            <Route path="/alumnos" element={<Students />} />
            <Route path="/alumnos/nuevo" element={<StudentForm />} />
            <Route path="/alumnos/editar/:id" element={<StudentForm />} />
            <Route path="/alumnos/:id" element={<StudentProfile />} />
            <Route path="/asistencia" element={<Attendance />} />
            <Route path="/eventos" element={<Events />} />
          </Route>

          {/* Accesible solo para admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
            <Route path="/cobros" element={<Payments />} />
            <Route path="/licencias" element={<Licenses />} />
            <Route path="/configuracion" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
