import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 4rem - 3rem)', /* Account for header and padding */
      backgroundImage: 'url(/tfg/images/templo_shaolin.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      textAlign: 'center',
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      padding: '2rem',
      boxShadow: 'var(--shadow-xl)',
      margin: '0 auto',
      maxWidth: '1200px'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)', /* Slate-900 with opacity */
        backdropFilter: 'blur(1px)',
        zIndex: 1
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', animation: 'fadeInUp 0.6s ease-out' }}>
        <h1 style={{ 
          fontSize: 'clamp(3rem, 8vw, 6rem)',  
          fontWeight: 900, 
          margin: 0, 
          lineHeight: 1,
          padding: '1rem',
          background: 'var(--gradient-shaolin)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0px 10px 40px rgba(211, 47, 47, 0.4)'
        }}>Error 404</h1>
        
        <h2 style={{ 
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
          marginBottom: '1rem', 
          fontWeight: 700,
          letterSpacing: '-0.02em'
        }}>
          Camino Perdido
        </h2>
        
        <p style={{ 
          fontSize: '1.1rem', 
          marginBottom: '2.5rem', 
          color: '#cbd5e1', 
          lineHeight: 1.6 
        }}>
          Como un monje que se adentra en la espesa niebla del templo, parece que te has desviado del sendero. La página que buscas no existe o ha sido movida.
        </p>
        
        <Link 
          to="/" 
          className="btn btn-primary"
          style={{ 
            padding: '0.875rem 2.5rem', 
            fontSize: '1.1rem',
            boxShadow: '0 10px 25px -5px rgba(211, 47, 47, 0.4)'
          }}
        >
          Volver a Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
