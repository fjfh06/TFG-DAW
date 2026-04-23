import { useState } from 'react';
import styles from './StudentAvatar.module.css';

interface StudentAvatarProps {
  photoUrl?: string | null;
  name: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar = ({ photoUrl, name, lastName, size = 'md', className = '' }: StudentAvatarProps) => {
  const [hasError, setHasError] = useState(false);

  // Obtener iniciales: primera letra del nombre + primera letra del apellido
  const getInitials = () => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || '?';
  };

  // Determinar el color de fondo basado en las iniciales para que sea pseudo-aleatorio pero constante para un mismo nombre
  const getBackgroundColor = () => {
    const initials = getInitials();
    if (initials === '?') return 'var(--color-gray-600)';
    
    const colors = [
      '#1e40af', // Blue 800
      '#b91c1c', // Red 700
      '#047857', // Emerald 700
      '#7c3aed', // Violet 600
      '#c026d3', // Fuchsia 600
      '#ea580c', // Orange 600
      '#0369a1', // Sky 700
      '#be185d', // Pink 700
      '#111827', // Gray 900
      '#1e3a8a', // Indigo 900
    ];
    
    const charCodeSum = initials.charCodeAt(0) + (initials.length > 1 ? initials.charCodeAt(1) : 0);
    return colors[charCodeSum % colors.length];
  };

  const getImageUrl = () => {
    if (!photoUrl) return "";
    if (photoUrl.startsWith("http") || photoUrl.startsWith("data:")) return photoUrl;
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/alumnos/foto/${photoUrl}`;
  };

  const showInitials = !photoUrl || hasError;

  return (
    <div 
      className={`${styles.avatarContainer} ${styles[size]} ${className}`}
      style={showInitials ? { backgroundColor: getBackgroundColor() } : undefined}
    >
      {showInitials ? (
        <span className={styles.initials}>{getInitials()}</span>
      ) : (
        <img 
          src={getImageUrl()} 
          alt={`Avatar de ${name} ${lastName}`} 
          className={styles.image}
          crossOrigin="use-credentials"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};
