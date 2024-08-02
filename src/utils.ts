export function hasElement<T extends readonly any[]>(
  arr: T,
  element: unknown,
): element is T[number] {
  return arr.includes(element);
}
