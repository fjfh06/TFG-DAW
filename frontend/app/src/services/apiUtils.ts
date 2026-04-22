/**
 * Helper para obtener el valor de una cookie por su nombre
 */
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

/**
 * Helper para obtener headers comunes, incluyendo el token CSRF si es necesario
 */
export function getHeaders(isFormData = false): HeadersInit {
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Si existe el token CSRF en las cookies, lo enviamos en la cabecera
  // Flask-JWT-Extended busca por defecto 'X-CSRF-TOKEN'
  const csrfToken = getCookie('csrf_access_token');
  if (csrfToken) {
    headers["X-CSRF-TOKEN"] = csrfToken;
  }

  return headers;
}

export const reqOpts: RequestInit = {
  credentials: "include"
};
