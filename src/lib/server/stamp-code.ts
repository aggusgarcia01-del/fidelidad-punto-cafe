import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

function getSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || "puntocafe-local-dev-secret";
}

function generateCodeForWindow(userId: string, window: number): string {
  const data = `${userId}:${window}`;
  const hmac = createHmac("sha256", getSecret()).update(data).digest("hex");
  const num = parseInt(hmac.substring(0, 8), 16);
  return String(num % 10000).padStart(4, "0");
}

export function getCurrentWindow(): number {
  return Math.floor(Date.now() / 1000 / 60);
}

export function generateStampCode(userId: string): string {
  return generateCodeForWindow(userId, getCurrentWindow());
}

export function verifyStampCode(userId: string, code: string): boolean {
  if (!code || code.length !== 4) return false;

  const currentWindow = getCurrentWindow();
  
  const validWindows = [currentWindow, currentWindow - 1];
  
  for (const window of validWindows) {
    const expected = generateCodeForWindow(userId, window);
    
    // We use timingSafeEqual to prevent timing attacks, even though it's just 4 digits
    const actualBuffer = Buffer.from(code);
    const expectedBuffer = Buffer.from(expected);
    
    if (actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)) {
      return true;
    }
  }

  return false;
}
