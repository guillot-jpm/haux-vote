import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
if (!secretKey) {
  throw new Error('JWT_SECRET or ADMIN_PASSWORD must be set');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}
