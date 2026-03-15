import { ActionableError } from "../../src/output/error";

describe("ActionableError", () => {
  it("creates error with message and suggestion", () => {
    const err = new ActionableError("Not configured", "pacifica-cli config init");
    expect(err.message).toBe("Not configured");
    expect(err.suggestion).toBe("pacifica-cli config init");
    expect(err.name).toBe("ActionableError");
  });

  it("creates error without suggestion", () => {
    const err = new ActionableError("Some error");
    expect(err.suggestion).toBeUndefined();
  });
});
