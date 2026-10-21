export class DataAccessError extends Error {
  code: "misconfigured" | "upstream";
  constructor(code: "misconfigured" | "upstream") {
    super(code);
    this.code = code;
  }
}
