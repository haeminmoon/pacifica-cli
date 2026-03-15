import { getOutputFormat } from "../../src/output/formatter";

describe("getOutputFormat", () => {
  it("returns json when specified", () => {
    expect(getOutputFormat({ output: "json" })).toBe("json");
  });

  it("defaults to table", () => {
    expect(getOutputFormat({})).toBe("table");
    expect(getOutputFormat({ output: "table" })).toBe("table");
  });
});
