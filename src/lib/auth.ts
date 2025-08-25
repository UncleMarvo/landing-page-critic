import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Log JWT configuration (remove in production)
console.log('JWT Configuration:', {
  secretSet: !!JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  secretLength: JWT_SECRET?.length
});

// Email verification token expiry (24 hours)
const VERIFICATION_EXPIRES_IN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Password reset token expiry (1 hour)
const RESET_EXPIRES_IN = 60 * 60 * 1000; // 1 hour in milliseconds

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful:', { userId: (decoded as any)?.userId });
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Generate random token for email verification and password reset
export function generateRandomToken(): string {
  return randomBytes(32).toString('hex');
}

// Set HTTP-only cookie with JWT token for Next.js App Router
export function setAuthCookie(res: any, token: string): void {
  if (res && typeof res.cookies === 'object') {
    // Next.js App Router - NextResponse
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
  } else if (res && typeof res.setHeader === 'function') {
    // Standard Node.js response (for compatibility)
    res.setHeader('Set-Cookie', [
      `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production'}`
    ]);
  }
}

// Clear auth cookie for Next.js App Router
export function clearAuthCookie(res: any): void {
  if (res && typeof res.cookies === 'object') {
    // Next.js App Router - NextResponse
    res.cookies.set('auth-token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'strict'
    });
  } else if (res && typeof res.setHeader === 'function') {
    // Standard Node.js response (for compatibility)
    res.setHeader('Set-Cookie', [
      'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    ]);
  }
}

// Get user from token (for API routes)
export async function getUserFromToken(token: string) {
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Create user with email verification
export async function createUserWithVerification(email: string, password: string, name: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateRandomToken();
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_IN);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    return { user, verificationToken };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Verify email with token
export async function verifyEmailWithToken(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user to verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}

// Create password reset token
export async function createPasswordResetToken(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return null;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + RESET_EXPIRES_IN);

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires,
      }
    });

    return resetToken;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw error;
  }
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      }
    });

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

// Authenticate user with email and password
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return null;
    }

    // Check if email is verified (optional - you can remove this check)
    // Temporarily disabled for development - users can log in without email verification
    // if (!user.emailVerified) {
    //   throw new Error('Please verify your email before logging in');
    // }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}
