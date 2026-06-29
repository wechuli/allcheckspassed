const summary = {
  addHeading: jest.fn().mockReturnThis(),
  addTable: jest.fn().mockReturnThis(),
  write: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  __esModule: true,
  getInput: jest.fn((name) => {
    const envName = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
    return process.env[envName] || "";
  }),
  setFailed: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
};

Object.defineProperty(module.exports, "summary", {
  configurable: true,
  enumerable: true,
  get: () => summary,
});
