module.exports = {
  __esModule: true,
};

Object.defineProperty(module.exports, "context", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: {
    eventName: "push",
    payload: {},
    repo: {
      owner: "test-owner",
      repo: "test-repo",
    },
    sha: "test-sha",
  },
});

module.exports.getOctokit = jest.fn();
