export function colorToHex(color: Record<string, number> | string | undefined | null): string {
  const parsed = typeof color === 'string' ? JSON.parse(color) : color ?? {};
  const { red = 0, green = 0, blue = 0 } = parsed;
  return `#${[red, green, blue].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
