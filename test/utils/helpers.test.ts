import {
  formatNumber,
  formatTimestamp,
  formatSide,
  parseIntStrict,
  truncateAddress,
} from "../../src/utils/helpers";

describe("formatNumber", () => {
  it("formats decimal strings", () => {
    expect(formatNumber("123.456000")).toBe("123.456");
    expect(formatNumber("100.000000")).toBe("100");
  });

  it("handles custom decimals", () => {
    expect(formatNumber("0.123456789", 4)).toBe("0.1235");
  });

  it("handles NaN gracefully", () => {
    expect(formatNumber("abc")).toBe("abc");
  });
});

describe("formatTimestamp", () => {
  it("converts ms timestamp to ISO string", () => {
    const result = formatTimestamp(1700000000000);
    expect(result).toContain("2023-11-14");
  });
});

describe("formatSide", () => {
  it("converts bid/ask to BUY/SELL", () => {
    expect(formatSide("bid")).toBe("BUY");
    expect(formatSide("ask")).toBe("SELL");
  });

  it("converts position sides", () => {
    expect(formatSide("open_long")).toBe("OPEN LONG");
    expect(formatSide("close_short")).toBe("CLOSE SHORT");
  });

  it("uppercases unknown sides", () => {
    expect(formatSide("unknown")).toBe("UNKNOWN");
  });
});

describe("parseIntStrict", () => {
  it("parses valid integers", () => {
    expect(parseIntStrict("42", "test")).toBe(42);
  });

  it("throws on invalid input", () => {
    expect(() => parseIntStrict("abc", "test")).toThrow("Invalid integer");
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    const addr = "42trU9A5gHJxLsMrz3XDFHFEkJpV3qBv9jZQEhGsMQkN";
    const result = truncateAddress(addr);
    expect(result).toBe("42trU9...GsMQkN");
  });

  it("keeps short addresses intact", () => {
    expect(truncateAddress("short")).toBe("short");
  });
});
