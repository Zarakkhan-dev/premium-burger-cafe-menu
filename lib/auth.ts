import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return null;

    // In a real app, check if refresh token is valid in database
    // For now, generate new tokens
    const newAccessToken = generateToken(decoded.userId, '', 'admin');
    const newRefreshToken = generateRefreshToken(decoded.userId);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    return null;
  }
}