import crypto from 'crypto';

export interface AuthPayload {
  userId: string;
  email: string;
  exp?: number;
}

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-at-least-32-characters-long';

function base64url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

export function signJwt(payload: AuthPayload, expiresInSeconds = 900): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token: string): AuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(signatureInput)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload: AuthPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      // Token expired
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
