module.exports = {
  __esModule: true,
  Octokit: jest.fn().mockImplementation((options) => ({
    options,
    paginate: jest.fn(),
    checks: {
      get: jest.fn(),
      listForRef: jest.fn(),
    },
    repos: {
      getCombinedStatusForRef: jest.fn(),
    },
  })),
};
