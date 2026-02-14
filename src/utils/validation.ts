import { z } from 'zod';

// ==================== TEACHER VALIDATION ====================

export const teacherLoginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long')
});

// ==================== STUDENT VALIDATION ====================

export const studentLoginSchema = z.object({
  classCode: z.string()
    .min(4, 'Class code must be at least 4 characters')
    .max(20, 'Class code too long')
    .regex(/^[A-Za-z0-9]+$/, 'Class code can only contain letters and numbers'),
  studentId: z.string()
    .min(4, 'Student ID must be at least 4 characters')
    .max(20, 'Student ID too long')
    .regex(/^[A-Za-z0-9]+$/, 'Student ID can only contain letters and numbers')
});

export const studentCreateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[\u0590-\u05FFa-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  studentId: z.string()
    .min(4, 'Student ID must be at least 4 characters')
    .max(20, 'Student ID too long')
    .regex(/^[A-Za-z0-9]+$/, 'Student ID can only contain letters and numbers'),
  classId: z.string()
    .min(1, 'Class is required'),
  isActive: z.boolean()
});

// ==================== CLASS VALIDATION ====================

export const classSchema = z.object({
  name: z.string()
    .min(2, 'Class name must be at least 2 characters')
    .max(50, 'Class name too long'),
  nameEn: z.string()
    .max(50, 'English name too long')
    .optional(),
  grade: z.string()
    .max(10, 'Grade too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long (max 500 characters)')
    .optional()
});

// ==================== MISSION VALIDATION ====================

export const missionSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title too long'),
  titleEn: z.string()
    .max(100, 'English title too long')
    .optional(),
  type: z.enum(['reading', 'comprehension', 'vocabulary'], {
    message: 'Invalid mission type'
  }),
  targetStories: z.number()
    .min(1, 'Must target at least 1 story')
    .max(20, 'Cannot target more than 20 stories'),
  points: z.number()
    .min(0, 'Points cannot be negative')
    .max(1000, 'Points cannot exceed 1000')
});

// ==================== SETTINGS VALIDATION ====================

export const profileSettingsSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  school: z.string()
    .max(100, 'School name too long')
    .optional()
});

// ==================== SANITIZATION UTILITIES ====================

/**
 * Sanitize string input by trimming and removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/script injection characters
    .slice(0, 10000); // Hard limit to prevent memory issues
}

/**
 * Sanitize object by sanitizing all string fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited
 * @param key - Unique identifier (e.g., 'login_teacher_email@example.com')
 * @param maxAttempts - Maximum allowed attempts
 * @param windowMs - Time window in milliseconds
 * @returns true if action should be blocked
 */
export function isRateLimited(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): { limited: boolean; remainingMs: number; remainingAttempts: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { limited: false, remainingMs: windowMs, remainingAttempts: maxAttempts - 1 };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { limited: false, remainingMs: windowMs, remainingAttempts: maxAttempts - 1 };
  }

  // Check if blocked
  if (entry.count >= maxAttempts) {
    const remainingMs = windowMs - (now - entry.firstAttempt);
    return { limited: true, remainingMs, remainingAttempts: 0 };
  }

  // Increment count
  entry.count++;
  const remainingMs = windowMs - (now - entry.firstAttempt);
  return { limited: false, remainingMs, remainingAttempts: maxAttempts - entry.count };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

// ==================== VALIDATION HELPER ====================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'general';
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
