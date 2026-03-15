export function formatNumber(value: string | number, decimals = 6): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}

export function formatSide(side: string): string {
  const map: Record<string, string> = {
    bid: "BUY",
    ask: "SELL",
    open_long: "OPEN LONG",
    open_short: "OPEN SHORT",
    close_long: "CLOSE LONG",
    close_short: "CLOSE SHORT",
    long: "LONG",
    short: "SHORT",
  };
  return map[side] || side.toUpperCase();
}

export function parseIntStrict(value: string, name: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer for ${name}: "${value}"`);
  }
  return parsed;
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
