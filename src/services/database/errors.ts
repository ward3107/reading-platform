export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class EntityNotFoundError extends DatabaseError {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string
  ) {
    super(
      `${entityType} with ID '${entityId}' not found`,
      'read'
    );
    this.name = 'EntityNotFoundError';
  }
}

export class DatabaseUnavailableError extends DatabaseError {
  constructor(operation: string) {
    super(
      'Database is not available. Check Firebase configuration.',
      operation
    );
    this.name = 'DatabaseUnavailableError';
  }
}
