import { useActionState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "../../components/common/Loader/Loader";
import { useLoading } from "../../hooks/useLoading";
import styles from "./Login.module.css";
import logoClubShaolin from "../../assets/logoClubShaolin.png";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useLoading(false);

  const from = location.state?.from?.pathname || "/";

  // Si ya tiene session, redirigir
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, isLoading]);

  // Lock body scroll to prevent mobile bounce/scroll issues
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  const formAction = async (
    _prev: { error: string | null },
    formData: FormData
  ) => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    if (!username || !password) {
      return { error: "Username y password son requeridos" };
    }

    const success = await login({ username, password });
    if (!success) {
      return { error: "Credenciales incorrectas o error de conexión" };
    }
    
    // El useEffect se encargará de la redirección cuando 'token' cambie
    return { error: null };
  };

  const [state, handleSubmit, isPending] = useActionState(formAction, {
    error: null,
  });

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending, setIsLoading]);

  return (
    <div className={styles.loginContainer}>
      <div className={`${styles.loginCard} card`}>
        <div className={styles.loginHeader}>
          {/* PLACEHOLDER DEL LOGO */}
          <div className={styles.logoWrapper}>
            <img src={logoClubShaolin} alt="Logo Club Shaolin" />
          </div>
          <h2>Club Shaolin Las Gabias</h2>
          <p>Acceso al Panel de Gestión</p>
        </div>

        <form 
          id="login_form"
          action={handleSubmit} 
          className={styles.loginForm}
        >
          {state.error && (
            <div className={styles.errorMessage}>
              {state.error}
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="user">Nombre de usuario</label>
            <input
              id="user"
              name="username"
              type="text"
              autoFocus
              autoComplete="username"
              placeholder="usuario"
              required
              className="input"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isPending}
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            {isLoading ? <Loader text="Iniciando sesión..." compact /> : "Entrar"}
          </button>
        </form>
      </div>

      <div className={styles.loginFooter}>
        <div className={styles.footerDivider}>
           <span className={styles.footerLine}></span>
           <span className={styles.footerIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10" />
                <circle cx="12" cy="7" r="2" fill="currentColor" />
                <circle cx="12" cy="17" r="2" fill="transparent" />
              </svg>
           </span>
           <span className={styles.footerLine}></span>
        </div>
        <p>
           © {new Date().getFullYear()} Club Shaolin Las Gabias
           <span className={styles.separator}> | </span>
           <br className={styles.mobileBreak} />
           Desarrollado por  <a href="http://fjfh06.ddns.net" target="_blank" rel="noreferrer" title="Visitar web del desarrollador">Fco. Javier Fdez</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
