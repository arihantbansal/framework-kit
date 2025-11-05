/**
 * Recursively freezes a value to avoid accidental mutation of initial state snapshots.
 *
 * @param value - Value to freeze in place.
 * @returns The same value with all nested objects frozen.
 */
export function deepFreeze<T>(value: T): T {
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    for (const key of Reflect.ownKeys(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const property = (value as any)[key];
        deepFreeze(property);
    }
    return Object.freeze(value);
}

/**
 * Returns the current timestamp in milliseconds.
 *
 * @returns Millisecond timestamp provided by {@link Date.now}.
 */
export function now(): number {
    return Date.now();
}

/**
 * Converts optional errors to a serializable string for logging.
 *
 * @param error - Arbitrary error value to format.
 * @returns String representation of the provided error.
 */
export function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}
