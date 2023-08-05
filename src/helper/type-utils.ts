export type ExcludePropKeys<T, U extends (string & {}) | keyof T> = keyof Omit<T, U>;
