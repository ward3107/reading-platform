import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  teacherLoginSchema,
  studentLoginSchema,
  studentCreateSchema,
  classSchema,
  missionSchema,
  profileSettingsSchema,
  sanitizeString,
  sanitizeObject,
  isRateLimited,
  resetRateLimit,
  clearAllRateLimits,
  validate
} from './validation';

// ============================================================================
// SANITIZE STRING FUNCTION TESTS
// ============================================================================
describe('sanitizeString', () => {
  // ---- HAPPY PATH ----
  it('should return trimmed string with no modifications for normal input', () => {
    const result = sanitizeString('  Hello World  ');
    expect(result).toBe('Hello World');
  });

  it('should handle Hebrew characters correctly', () => {
    const result = sanitizeString('  שלום עולם  ');
    expect(result).toBe('שלום עולם');
  });

  it('should handle mixed Hebrew and English text', () => {
    const result = sanitizeString('Hello שלום World');
    expect(result).toBe('Hello שלום World');
  });

  // ---- EDGE CASES ----
  it('should return empty string when given only whitespace', () => {
    expect(sanitizeString('     ')).toBe('');
  });

  it('should return empty string when given empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should truncate string at 10000 characters', () => {
    const longString = 'a'.repeat(15000);
    const result = sanitizeString(longString);
    expect(result.length).toBe(10000);
  });

  it('should handle string at exactly 10000 characters without truncation', () => {
    const exactString = 'a'.repeat(10000);
    const result = sanitizeString(exactString);
    expect(result.length).toBe(10000);
    expect(result).toBe(exactString);
  });

  it('should handle string at 9999 characters without truncation', () => {
    const almostLimit = 'a'.repeat(9999);
    const result = sanitizeString(almostLimit);
    expect(result.length).toBe(9999);
  });

  it('should preserve newlines and tabs after trimming', () => {
    const result = sanitizeString('line1\nline2\ttab');
    expect(result).toBe('line1\nline2\ttab');
  });

  // ---- INJECTION PREVENTION ----
  it('should remove angle brackets to prevent HTML injection', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('should remove angle brackets from complex HTML', () => {
    expect(sanitizeString('<img src=x onerror=alert(1)>')).toBe('img src=x onerror=alert(1)');
  });

  it('should remove angle brackets from SVG-based XSS', () => {
    expect(sanitizeString('<svg onload=alert(1)>')).toBe('svg onload=alert(1)');
  });

  it('should handle nested angle brackets', () => {
    expect(sanitizeString('<<script>>')).toBe('script');
  });
});

// ============================================================================
// SANITIZE OBJECT FUNCTION TESTS
// ============================================================================
describe('sanitizeObject', () => {
  // ---- HAPPY PATH ----
  it('should sanitize all string fields in a flat object', () => {
    const input = {
      name: '  John Doe  ',
      email: '  john@example.com  ',
      age: 25
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.age).toBe(25);
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '  John  ',
        profile: {
          bio: '  Hello World  '
        }
      },
      active: true
    };
    const result = sanitizeObject(input);
    expect(result.user.name).toBe('John');
    expect(result.user.profile.bio).toBe('Hello World');
    expect(result.active).toBe(true);
  });

  // ---- EDGE CASES ----
  it('should return empty object when given empty object', () => {
    const result = sanitizeObject({});
    expect(result).toEqual({});
  });

  it('should preserve null values', () => {
    const input = { name: 'John', nickname: null };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John');
    expect(result.nickname).toBeNull();
  });

  it('should preserve undefined values', () => {
    const input = { name: 'John', nickname: undefined };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John');
    expect(result.nickname).toBeUndefined();
  });

  it('should preserve numeric values including zero', () => {
    const input = { count: 0, price: 99.99, negative: -5 };
    const result = sanitizeObject(input);
    expect(result.count).toBe(0);
    expect(result.price).toBe(99.99);
    expect(result.negative).toBe(-5);
  });

  it('should preserve boolean values', () => {
    const input = { active: true, deleted: false };
    const result = sanitizeObject(input);
    expect(result.active).toBe(true);
    expect(result.deleted).toBe(false);
  });

  it('should convert arrays to objects (arrays are objects in JS)', () => {
    // Note: sanitizeObject treats arrays as objects, which converts them
    // This is expected behavior - if you need to preserve arrays,
    // use a different sanitization approach
    const input = { tags: ['  tag1  ', 'tag2'] };
    const result = sanitizeObject(input);
    // Arrays are converted to objects with numeric keys
    expect(result.tags).toEqual({ '0': 'tag1', '1': 'tag2' });
  });

  it('should handle objects with only non-string values', () => {
    const input = { count: 1, active: true, data: null };
    const result = sanitizeObject(input);
    expect(result).toEqual({ count: 1, active: true, data: null });
  });

  // ---- INJECTION PREVENTION ----
  it('should remove HTML characters from nested string fields', () => {
    const input = {
      name: '<script>alert(1)</script>',
      profile: {
        bio: '<img src=x onerror=alert(1)>'
      }
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('scriptalert(1)/script');
    expect(result.profile.bio).toBe('img src=x onerror=alert(1)');
  });
});

// ============================================================================
// RATE LIMITING FUNCTION TESTS
// ============================================================================
describe('Rate Limiting', () => {
  beforeEach(() => {
    clearAllRateLimits();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- HAPPY PATH ----
  describe('isRateLimited', () => {
    it('should allow first attempt and return correct remaining attempts', () => {
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should increment count on subsequent attempts within window', () => {
      isRateLimited('test-key', 5, 60000);
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBe(3);
    });

    it('should block after max attempts reached', () => {
      for (let i = 0; i < 5; i++) {
        isRateLimited('test-key', 5, 60000);
      }
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should return remaining time when blocked', () => {
      for (let i = 0; i < 5; i++) {
        isRateLimited('test-key', 5, 60000);
      }
      vi.advanceTimersByTime(30000); // 30 seconds passed
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(true);
      expect(result.remainingMs).toBeLessThanOrEqual(30000);
    });

    it('should reset count after window expires', () => {
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        isRateLimited('test-key', 5, 60000);
      }

      // Advance past window
      vi.advanceTimersByTime(61000);

      // Should allow again
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should use default values when not specified', () => {
      const result = isRateLimited('test-key');
      expect(result.limited).toBe(false);
      expect(result.remainingMs).toBe(15 * 60 * 1000);
    });

    it('should track different keys independently', () => {
      isRateLimited('key-1', 5, 60000);
      isRateLimited('key-1', 5, 60000);
      const result1 = isRateLimited('key-1', 5, 60000);
      const result2 = isRateLimited('key-2', 5, 60000);

      expect(result1.remainingAttempts).toBe(2);
      expect(result2.remainingAttempts).toBe(4);
    });

    // ---- EDGE CASES ----
    it('should handle maxAttempts of 1', () => {
      const first = isRateLimited('test-key', 1, 60000);
      expect(first.limited).toBe(false);
      expect(first.remainingAttempts).toBe(0);

      const second = isRateLimited('test-key', 1, 60000);
      expect(second.limited).toBe(true);
    });

    it('should handle very short window', () => {
      isRateLimited('test-key', 5, 100);
      vi.advanceTimersByTime(101);
      const result = isRateLimited('test-key', 5, 100);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should handle empty string key', () => {
      const result = isRateLimited('', 5, 60000);
      expect(result.limited).toBe(false);
    });

    it('should handle special characters in key', () => {
      const result = isRateLimited('user@example.com::login', 5, 60000);
      expect(result.limited).toBe(false);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a specific key', () => {
      // Use up attempts
      for (let i = 0; i < 5; i++) {
        isRateLimited('test-key', 5, 60000);
      }

      // Verify blocked
      expect(isRateLimited('test-key', 5, 60000).limited).toBe(true);

      // Reset
      resetRateLimit('test-key');

      // Should allow again
      const result = isRateLimited('test-key', 5, 60000);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should not affect other keys when resetting', () => {
      for (let i = 0; i < 5; i++) {
        isRateLimited('key-1', 5, 60000);
        isRateLimited('key-2', 5, 60000);
      }

      resetRateLimit('key-1');

      expect(isRateLimited('key-1', 5, 60000).limited).toBe(false);
      expect(isRateLimited('key-2', 5, 60000).limited).toBe(true);
    });

    it('should handle resetting non-existent key without error', () => {
      expect(() => resetRateLimit('non-existent-key')).not.toThrow();
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', () => {
      // Create multiple rate limited keys
      for (let i = 0; i < 5; i++) {
        isRateLimited(`key-${i}`, 5, 60000);
        isRateLimited(`key-${i}`, 5, 60000);
        isRateLimited(`key-${i}`, 5, 60000);
      }

      clearAllRateLimits();

      // All should start fresh
      for (let i = 0; i < 5; i++) {
        const result = isRateLimited(`key-${i}`, 5, 60000);
        expect(result.limited).toBe(false);
        expect(result.remainingAttempts).toBe(4);
      }
    });
  });
});

// ============================================================================
// VALIDATE HELPER FUNCTION TESTS
// ============================================================================
describe('validate', () => {
  const simpleSchema = teacherLoginSchema;

  // ---- HAPPY PATH ----
  it('should return success with data for valid input', () => {
    const result = validate(simpleSchema, {
      email: 'teacher@example.com',
      password: 'password123'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('teacher@example.com');
      expect(result.data.password).toBe('password123');
    }
  });

  // ---- FAILURE CASES ----
  it('should return errors object for invalid input', () => {
    const result = validate(simpleSchema, {
      email: 'invalid-email',
      password: '123'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('password');
    }
  });

  it('should return errors for missing fields', () => {
    const result = validate(simpleSchema, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    }
  });

  it('should only include first error per field', () => {
    const result = validate(simpleSchema, {
      email: '', // Empty fails min(1) and email format
      password: '' // Empty fails min(6)
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // Should only have one error per field
      expect(typeof result.errors.email).toBe('string');
      expect(typeof result.errors.password).toBe('string');
    }
  });

  // ---- EDGE CASES ----
  it('should handle null input', () => {
    const result = validate(simpleSchema, null);
    expect(result.success).toBe(false);
  });

  it('should handle undefined input', () => {
    const result = validate(simpleSchema, undefined);
    expect(result.success).toBe(false);
  });

  it('should handle array input instead of object', () => {
    const result = validate(simpleSchema, ['email@test.com', 'password']);
    expect(result.success).toBe(false);
  });

  it('should handle extra fields in input', () => {
    const result = validate(simpleSchema, {
      email: 'teacher@example.com',
      password: 'password123',
      extraField: 'should be ignored'
    });

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// TEACHER LOGIN SCHEMA TESTS
// ============================================================================
describe('teacherLoginSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid teacher credentials', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'teacher@school.il',
      password: 'securePassword123'
    });
    expect(result.success).toBe(true);
  });

  it('should accept email at maximum length (255 chars)', () => {
    const longEmail = 'a'.repeat(243) + '@example.com'; // 255 chars total
    const result = teacherLoginSchema.safeParse({
      email: longEmail,
      password: 'password123'
    });
    expect(result.success).toBe(true);
  });

  it('should accept password at maximum length (128 chars)', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(128)
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test@example',
      'test @example.com',
      'test@example .com'
    ];

    invalidEmails.forEach(email => {
      const result = teacherLoginSchema.safeParse({
        email,
        password: 'password123'
      });
      expect(result.success).toBe(false);
    });
  });

  it('should reject empty email', () => {
    const result = teacherLoginSchema.safeParse({
      email: '',
      password: 'password123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 6 characters', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'test@example.com',
      password: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'test@example.com',
      password: ''
    });
    expect(result.success).toBe(false);
  });

  it('should reject email over 255 characters', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'a'.repeat(256) + '@example.com',
      password: 'password123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject password over 128 characters', () => {
    const result = teacherLoginSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(129)
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// STUDENT LOGIN SCHEMA TESTS
// ============================================================================
describe('studentLoginSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid student login credentials', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC123',
      studentId: 'STD456'
    });
    expect(result.success).toBe(true);
  });

  it('should accept alphanumeric class codes', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABCD1234',
      studentId: '12345'
    });
    expect(result.success).toBe(true);
  });

  it('should accept class code at maximum length (20 chars)', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'A'.repeat(20),
      studentId: '12345'
    });
    expect(result.success).toBe(true);
  });

  it('should accept student ID at maximum length (20 chars)', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC123',
      studentId: '1'.repeat(20)
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject class code with special characters', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC-123',
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject class code with spaces', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC 123',
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject class code shorter than 4 characters', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC',
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty class code', () => {
    const result = studentLoginSchema.safeParse({
      classCode: '',
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject class code over 20 characters', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'A'.repeat(21),
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject student ID with special characters', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC123',
      studentId: '12-345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject student ID shorter than 4 characters', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC123',
      studentId: '123'
    });
    expect(result.success).toBe(false);
  });

  // ---- INJECTION PREVENTION ----
  it('should reject class code with SQL-like patterns', () => {
    const result = studentLoginSchema.safeParse({
      classCode: "ABC'; DROP TABLE--",
      studentId: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('should reject student ID with script tags', () => {
    const result = studentLoginSchema.safeParse({
      classCode: 'ABC123',
      studentId: '<script>123'
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// STUDENT CREATE SCHEMA TESTS
// ============================================================================
describe('studentCreateSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid student data', () => {
    const result = studentCreateSchema.safeParse({
      name: 'דניאל כהן',
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(true);
  });

  it('should validate English name', () => {
    const result = studentCreateSchema.safeParse({
      name: "John O'Brien",
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(true);
  });

  it('should accept name with hyphens', () => {
    const result = studentCreateSchema.safeParse({
      name: 'Mary-Jane Smith',
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject name with numbers', () => {
    const result = studentCreateSchema.safeParse({
      name: 'John123',
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(false);
  });

  it('should reject name shorter than 2 characters', () => {
    const result = studentCreateSchema.safeParse({
      name: 'J',
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(false);
  });

  it('should reject name over 100 characters', () => {
    const result = studentCreateSchema.safeParse({
      name: 'J'.repeat(101),
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty classId', () => {
    const result = studentCreateSchema.safeParse({
      name: 'John Doe',
      studentId: '12345',
      classId: '',
      isActive: true
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-boolean isActive', () => {
    const result = studentCreateSchema.safeParse({
      name: 'John Doe',
      studentId: '12345',
      classId: 'class-123',
      isActive: 'true'
    });
    expect(result.success).toBe(false);
  });

  // ---- INJECTION PREVENTION ----
  it('should reject name with HTML tags', () => {
    const result = studentCreateSchema.safeParse({
      name: '<script>John</script>',
      studentId: '12345',
      classId: 'class-123',
      isActive: true
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CLASS SCHEMA TESTS
// ============================================================================
describe('classSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid class data with all fields', () => {
    const result = classSchema.safeParse({
      name: 'כיתה א׳',
      nameEn: 'Class A',
      grade: '7',
      description: 'A description'
    });
    expect(result.success).toBe(true);
  });

  it('should validate class data with only required fields', () => {
    const result = classSchema.safeParse({
      name: 'כיתה א׳'
    });
    expect(result.success).toBe(true);
  });

  it('should accept description at maximum length (500 chars)', () => {
    const result = classSchema.safeParse({
      name: 'Class A',
      description: 'a'.repeat(500)
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject name shorter than 2 characters', () => {
    const result = classSchema.safeParse({
      name: 'A'
    });
    expect(result.success).toBe(false);
  });

  it('should reject name over 50 characters', () => {
    const result = classSchema.safeParse({
      name: 'A'.repeat(51)
    });
    expect(result.success).toBe(false);
  });

  it('should reject nameEn over 50 characters', () => {
    const result = classSchema.safeParse({
      name: 'Class',
      nameEn: 'A'.repeat(51)
    });
    expect(result.success).toBe(false);
  });

  it('should reject grade over 10 characters', () => {
    const result = classSchema.safeParse({
      name: 'Class',
      grade: '12345678901' // 11 chars
    });
    expect(result.success).toBe(false);
  });

  it('should reject description over 500 characters', () => {
    const result = classSchema.safeParse({
      name: 'Class',
      description: 'a'.repeat(501)
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// MISSION SCHEMA TESTS
// ============================================================================
describe('missionSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid mission data', () => {
    const result = missionSchema.safeParse({
      title: 'Reading Challenge',
      titleEn: 'Reading Challenge',
      type: 'reading',
      targetStories: 5,
      points: 100
    });
    expect(result.success).toBe(true);
  });

  it('should accept all valid mission types', () => {
    const types = ['reading', 'comprehension', 'vocabulary'] as const;
    types.forEach(type => {
      const result = missionSchema.safeParse({
        title: 'Mission',
        type,
        targetStories: 1,
        points: 10
      });
      expect(result.success).toBe(true);
    });
  });

  it('should accept zero points', () => {
    const result = missionSchema.safeParse({
      title: 'Free Mission',
      type: 'reading',
      targetStories: 1,
      points: 0
    });
    expect(result.success).toBe(true);
  });

  it('should accept maximum points (1000)', () => {
    const result = missionSchema.safeParse({
      title: 'Big Mission',
      type: 'reading',
      targetStories: 1,
      points: 1000
    });
    expect(result.success).toBe(true);
  });

  it('should accept maximum targetStories (20)', () => {
    const result = missionSchema.safeParse({
      title: 'Marathon',
      type: 'reading',
      targetStories: 20,
      points: 500
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject invalid mission type', () => {
    const result = missionSchema.safeParse({
      title: 'Mission',
      type: 'invalid-type',
      targetStories: 1,
      points: 10
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative points', () => {
    const result = missionSchema.safeParse({
      title: 'Mission',
      type: 'reading',
      targetStories: 1,
      points: -10
    });
    expect(result.success).toBe(false);
  });

  it('should reject points over 1000', () => {
    const result = missionSchema.safeParse({
      title: 'Mission',
      type: 'reading',
      targetStories: 1,
      points: 1001
    });
    expect(result.success).toBe(false);
  });

  it('should reject targetStories of zero', () => {
    const result = missionSchema.safeParse({
      title: 'Mission',
      type: 'reading',
      targetStories: 0,
      points: 10
    });
    expect(result.success).toBe(false);
  });

  it('should reject targetStories over 20', () => {
    const result = missionSchema.safeParse({
      title: 'Mission',
      type: 'reading',
      targetStories: 21,
      points: 10
    });
    expect(result.success).toBe(false);
  });

  it('should reject title shorter than 2 characters', () => {
    const result = missionSchema.safeParse({
      title: 'M',
      type: 'reading',
      targetStories: 1,
      points: 10
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PROFILE SETTINGS SCHEMA TESTS
// ============================================================================
describe('profileSettingsSchema', () => {
  // ---- HAPPY PATH ----
  it('should validate valid profile settings', () => {
    const result = profileSettingsSchema.safeParse({
      name: 'John Doe',
      school: 'Springfield Elementary'
    });
    expect(result.success).toBe(true);
  });

  it('should validate profile with only name', () => {
    const result = profileSettingsSchema.safeParse({
      name: 'John Doe'
    });
    expect(result.success).toBe(true);
  });

  // ---- FAILURE CASES ----
  it('should reject name shorter than 2 characters', () => {
    const result = profileSettingsSchema.safeParse({
      name: 'J'
    });
    expect(result.success).toBe(false);
  });

  it('should reject name over 100 characters', () => {
    const result = profileSettingsSchema.safeParse({
      name: 'J'.repeat(101)
    });
    expect(result.success).toBe(false);
  });

  it('should reject school name over 100 characters', () => {
    const result = profileSettingsSchema.safeParse({
      name: 'John',
      school: 'S'.repeat(101)
    });
    expect(result.success).toBe(false);
  });
});
