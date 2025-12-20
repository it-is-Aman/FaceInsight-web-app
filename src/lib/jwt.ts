import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET;
const key = new TextEncoder().encode(SECRET_KEY);

export interface GuestTokenPayload {
    count: number;
    jti?: string;
    iat?: number;
}

export async function signGuestToken(payload: GuestTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(key);
}

export async function verifyGuestToken(token: string): Promise<GuestTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as unknown as GuestTokenPayload;
    } catch (error) {
        console.error('Failed to verify guest token:', error);
        return null;
    }
}
