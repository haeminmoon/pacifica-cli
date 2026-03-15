export type OutputFormat = "json" | "table";

export function getOutputFormat(options: { output?: string }): OutputFormat {
  if (options.output === "json") return "json";
  return "table";
}

export function output(data: unknown, format: OutputFormat): void {
  if (format === "json") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  printTable(data);
}

function printTable(data: unknown): void {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log("No data");
      return;
    }
    console.table(data);
    return;
  }

  if (data !== null && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    const maxKeyLen = Math.max(...entries.map(([k]) => k.length));
    for (const [key, value] of entries) {
      const formattedValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      console.log(`  ${key.padEnd(maxKeyLen)}  ${formattedValue}`);
    }
    return;
  }

  console.log(data);
}
