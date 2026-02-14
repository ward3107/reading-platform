import { db } from '../../config/firebase';
import { DatabaseError, DatabaseUnavailableError } from './errors';

export const isDemoMode = !db;

export function assertDatabaseAvailable(): void {
  if (!db) {
    throw new DatabaseUnavailableError('database operation');
  }
}

export function handleDatabaseError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): never {
  console.error(`Database error during ${operation}:`, {
    error,
    context,
    timestamp: new Date().toISOString()
  });

  if (error instanceof DatabaseError) {
    throw error;
  }

  throw new DatabaseError(
    `Failed to ${operation}`,
    operation,
    error
  );
}

export function getDatabase() {
  assertDatabaseAvailable();
  return db!;
}
