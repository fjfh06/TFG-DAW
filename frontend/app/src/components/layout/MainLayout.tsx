import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSeason } from "../../hooks/useSeason";
import { Loader } from "../common/Loader/Loader";
import styles from "./Layout.module.css";
import { Menu, X } from "lucide-react";
import logoClubShaolin from "../../assets/logoClubShaolin.png";
import { formatRole } from "../../utils/formatters";
import { Footer } from "./Footer/Footer";

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { seasons, currentSeason, setCurrentSeason, isLoadingSeasons } = useSeason();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.layoutContainer}>
      {isLoadingSeasons && <Loader fullPage text="Sincronizando Temporada..." />}
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <img src={logoClubShaolin} alt="Logo Club Shaolin" />
          </div>
          <h2>Club Shaolin Las Gabias</h2>
          <button className={styles.closeMenuBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            Dashboard
          </NavLink>

          {(user?.rol === "admin" || user?.rol === "ayudante") && (
            <>
              <NavLink
                to="/alumnos"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Alumnos
              </NavLink>
              <NavLink
                to="/asistencia"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Asistencia
              </NavLink>
              <NavLink
                to="/eventos"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Eventos
              </NavLink>
            </>
          )}

          {user?.rol === "admin" && (
            <>
              <NavLink
                to="/cobros"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Cobros y Tarifas
              </NavLink>
              <NavLink
                to="/licencias"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Licencias
              </NavLink>
              <NavLink
                to="/configuracion"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                Configuración
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.seasonSelectorMobile}>
            <label className={styles.seasonLabel}>Temporada:</label>
            <select
              className={styles.seasonSelect}
              value={currentSeason?.id || ""}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                const season = seasons.find((s) => s.id === selectedId);
                if (season) setCurrentSeason(season);
              }}
              disabled={isLoadingSeasons || seasons.length === 0}
            >
              {isLoadingSeasons ? (
                <option value="">...</option>
              ) : seasons.length === 0 ? (
                <option value="">Sin temporadas</option>
              ) : (
                seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.nombre} {season.activa ? "(Actual)" : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.nombre}</span>
            <span className={styles.userRole}>{formatRole(user?.rol)}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.burgerBtn} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>Panel de Control</h1>
          </div>
          {/* <div className={styles.topbarRight}>
            <div className={styles.seasonSelectorTopbar}>
               <select
                  className={styles.topbarSeasonSelect}
                  value={currentSeason?.id || ""}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    const season = seasons.find((s) => s.id === selectedId);
                    if (season) setCurrentSeason(season);
                  }}
                  disabled={isLoadingSeasons || seasons.length === 0}
                >
                  {isLoadingSeasons ? (
                    <option value="">...</option>
                  ) : seasons.length === 0 ? (
                    <option value="">Sin temporadas</option>
                  ) : (
                    seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.nombre}
                      </option>
                    ))
                  )}
                </select>
            </div>
          </div> */}
        </header>

        <div className={styles.pageContent}>
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
