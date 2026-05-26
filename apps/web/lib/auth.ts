// Frontend JWT validation logic using a standard library would be better,
// but for this demo-to-monorepo transition, we'll keep it as a placeholder
// that should ideally use 'jose' or 'jsonwebtoken' on the client side.

export interface AuthPayload {
  sub: string;
  email: string;
}

export function parseJwt(token: string): AuthPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
