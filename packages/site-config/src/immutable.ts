export type DeepReadonly<T> =
  T extends (...args: never[]) => unknown ? T :
  T extends readonly unknown[] ? {readonly [Key in keyof T]: DeepReadonly<T[Key]>} :
  T extends object ? {readonly [Key in keyof T]: DeepReadonly<T[Key]>} :
  T;

export function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }

  return value as DeepReadonly<T>;
}
