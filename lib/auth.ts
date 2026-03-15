export interface AuthPayload {
  userId: string;
  email: string;
}

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function signJwt(payload: AuthPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from(`${encoded}.${SECRET}`).toString('base64url').slice(0, 16);
  return `${encoded}.${signature}`;
}

export function verifyJwt(token: string): AuthPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = Buffer.from(`${encoded}.${SECRET}`).toString('base64url').slice(0, 16);
  if (signature !== expected) return null;
  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AuthPayload;
}
