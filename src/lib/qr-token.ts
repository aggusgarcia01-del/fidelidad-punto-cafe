import { SignJWT, jwtVerify } from 'jose';

// Asegurarse de que el secret esté disponible
function getSecret() {
  const secretString = process.env.CUSTOMER_SESSION_SECRET || 'fallback_secret_for_qr_development';
  return new TextEncoder().encode(secretString);
}

export async function generateQRToken(userId: string, dni: string) {
  const nonce = crypto.randomUUID();
  const secret = getSecret();
  
  return await new SignJWT({ userId, dni, nonce })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m') // Expira en 5 minutos para seguridad
    .sign(secret);
}

export async function verifyQRToken(token: string) {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; dni: string; nonce: string; exp: number };
  } catch (error) {
    throw new Error('TOKEN_INVALID_OR_EXPIRED');
  }
}
