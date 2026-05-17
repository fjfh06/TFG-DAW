import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.siteFooter}>
       <div className={styles.footerContent}>
          <div className={styles.footerDivider}>
             <span className={styles.footerLine}></span>
             <span className={styles.footerIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10" />
                  <circle cx="12" cy="7" r="2" fill="currentColor" />
                  <circle cx="12" cy="17" r="2" fill="#1e1b4b" />
                </svg>
             </span>
             <span className={styles.footerLine}></span>
          </div>
          <p className={styles.footerTextPrimary}>
            © Copyright {new Date().getFullYear()} Club Shaolin Las Gabias. Todos los derechos reservados.
          </p>
          <p className={styles.footerTextSecondary}>
            Página web desarrollada por <a href="http://fjfh06.ddns.net" target="_blank" rel="noreferrer" title="Visitar web del desarrollador">Fco. Javier Fdez</a>
          </p>
       </div>
    </footer>
  );
};
