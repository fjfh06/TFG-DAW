/**
 * Formatea el rol del usuario para visualización amigable
 * @param role 'admin' | 'ayudante' | 'user'
 * @returns string 'Administrador' | 'Ayudante' | 'Usuario'
 */
export const formatRole = (role?: string): string => {
  if (!role) return '';
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrador';
    case 'ayudante':
      return 'Ayudante';
    case 'user':
      return 'Usuario';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

/**
 * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY
 * @param dateStr string '2026-10-31'
 * @returns string '31/10/2026'
 */
export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  
  // Si viene con hora (T00:00:00), nos quedamos solo con la fecha
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanDate.split('-');
  
  if (!year || !month || !day) return dateStr; // Por si acaso el formato no es el esperado
  
  return `${day}/${month}/${year}`;
};
