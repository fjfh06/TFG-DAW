import { useActionState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "../../components/common/Loader/Loader";
import styles from "./Login.module.css";
import logoClubShaolin from "../../assets/logoClubShaolin.png";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Si ya tiene session, redirigir
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
          method="POST"
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
            disabled={isPending}
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            {isPending ? <Loader text="Iniciando sesión..." compact /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
