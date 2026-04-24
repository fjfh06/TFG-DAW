import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/common/ScrollToTop';
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
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Toaster 
        position="top-right" 
        richColors 
        duration={2500}
      />
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

          {/* 404 Route inside layout so the menu stays visible */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
