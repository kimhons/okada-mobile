import { ENV } from "./env";

export interface TokenPayload {
  userId: number;
  openId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Simple base64 token encoding/decoding for WebSocket auth
 * Uses the cookie secret for basic validation
 */

/**
 * Sign a token with the given payload
 */
export function signToken(payload: Omit<TokenPayload, "iat" | "exp">, _expiresIn: string = "7d"): string {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  const signature = Buffer.from(ENV.cookieSecret + encoded).toString("base64").slice(0, 32);
  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    
    const expectedSig = Buffer.from(ENV.cookieSecret + encoded).toString("base64").slice(0, 32);
    if (signature !== expectedSig) return null;
    
    const decoded = JSON.parse(Buffer.from(encoded, "base64").toString()) as TokenPayload;
    
    // Check expiration
    if (decoded.exp && decoded.exp < Date.now()) return null;
    
    return decoded;
  } catch (error) {
    console.error("[JWT] Token verification failed:", error);
    return null;
  }
}
