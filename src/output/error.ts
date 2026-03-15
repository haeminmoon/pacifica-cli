import axios from "axios";

export class ActionableError extends Error {
  constructor(
    message: string,
    public readonly suggestion?: string
  ) {
    super(message);
    this.name = "ActionableError";
  }
}

export function formatError(error: unknown): string {
  if (error instanceof ActionableError) {
    let msg = `\nError: ${error.message}`;
    if (error.suggestion) {
      msg += `\n\nTry: ${error.suggestion}`;
    }
    return msg;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status;
    const msg =
      data?.error || data?.message || error.message || "Unknown API error";
    let output = `\nAPI Error (${status || "unknown"}): ${msg}`;
    if (data?.code) {
      output += `\nCode: ${data.code}`;
    }
    if (data) {
      output += `\nDetail: ${JSON.stringify(data)}`;
    } else {
      output += `\nResponse: ${error.response?.statusText || "no body"}`;
    }
    return output;
  }

  if (error instanceof Error) {
    return `\nError: ${error.message}`;
  }

  return `\nUnknown error: ${String(error)}`;
}

export function handleError(error: unknown): never {
  console.error(formatError(error));
  process.exit(1);
}
