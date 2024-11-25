/**
 * Make all properties of an object optional, recursively.
 * @internal
 */
export type DeeplyPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeeplyPartial<U>[]
    : T[P] extends object
      ? DeeplyPartial<T[P]>
      : T[P];
};
