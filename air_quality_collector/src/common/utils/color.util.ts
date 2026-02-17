export function colorToHex(color: Record<string, number> | undefined | null): string {
  const { red = 0, green = 0, blue = 0 } = color ?? {};
  return `#${[red, green, blue].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
