/**
 * Tests for utility functions in checkNameExtractor.ts
 *
 * Key test scenarios:
 * 1. When checkRunId is available, extractOwnCheckNameFromWorkflow should use getCheckNameFromCheckRunId
 * 2. When checkRunId is not available, it should fall back to parsing the workflow file
 * 3. Error handling for both scenarios
 * 4. Edge cases including missing environment variables and invalid workflow refs
 *
 * Note: Check run IDs are always positive integers (starting from 1), never 0
 */

import * as core from "@actions/core";
import * as github from "@actions/github";

// Mock dependencies
jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../src/utils/inputsExtractor");
jest.mock("../src/utils/octokit");

const mockCore = core as jest.Mocked<typeof core>;

// Mock the sanitizedInputs module - make it mutable
const mockSanitizedInputs: any = {
  commitSHA: "test-sha",
  checkRunId: undefined,
  checksInclude: [],
  checksExclude: [],
  treatSkippedAsPassed: false,
  treatNeutralAsPassed: false,
  poll: true,
  delay: 0,
  pollingInterval: 30,
  retries: 3,
  failFast: false,
  failStep: false,
  failOnMissingChecks: false,
  verbose: false,
  showJobSummary: false,
};

// Mock the octokit restClient
const mockRestClient = {
  repos: {
    getContent: jest.fn(),
  },
  checks: {
    get: jest.fn(),
  },
};

// Setup mocks before requiring the module
jest.doMock("../src/utils/inputsExtractor", () => ({
  sanitizedInputs: mockSanitizedInputs,
}));

jest.doMock("../src/utils/octokit", () => ({
  restClient: mockRestClient,
}));

// Import after mocking
const {
  extractOwnCheckNameFromWorkflow,
} = require("../src/utils/checkNameExtractor");

describe("extractOwnCheckNameFromWorkflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup github context mock
    Object.defineProperty(github, "context", {
      value: {
        repo: {
          owner: "test-owner",
          repo: "test-repo",
        },
      },
      writable: true,
    });

    // Setup default environment variables
    process.env.GITHUB_WORKFLOW_REF =
      "test-owner/test-repo/.github/workflows/test.yml@refs/heads/main";
    process.env.GITHUB_JOB = "test-job";
  });

  afterEach(() => {
    delete process.env.GITHUB_WORKFLOW_REF;
    delete process.env.GITHUB_JOB;
  });

  describe("when checkRunId is available", () => {
    beforeEach(() => {
      // Set checkRunId in sanitizedInputs
      mockSanitizedInputs.checkRunId = 12345;
    });

    afterEach(() => {
      mockSanitizedInputs.checkRunId = undefined;
    });

    it("should use getCheckNameFromCheckRunId to get the check name", async () => {
      const expectedCheckName = "Test Check Name";

      mockRestClient.checks.get.mockResolvedValue({
        data: {
          name: expectedCheckName,
        },
      });

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockRestClient.checks.get).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        check_run_id: 12345,
      });
      expect(mockCore.debug).toHaveBeenCalledWith(
        `Extracted check name from check run id: ${expectedCheckName}`
      );
      expect(result).toBe(expectedCheckName);
    });

    it("should not call repos.getContent when checkRunId is available", async () => {
      mockRestClient.checks.get.mockResolvedValue({
        data: {
          name: "Test Check Name",
        },
      });

      await extractOwnCheckNameFromWorkflow();

      expect(mockRestClient.repos.getContent).not.toHaveBeenCalled();
    });

    it("should handle errors from getCheckNameFromCheckRunId and fall back to job name", async () => {
      const errorMessage = "Check run not found";
      mockRestClient.checks.get.mockRejectedValue(new Error(errorMessage));

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockCore.warning).toHaveBeenCalledWith(
        expect.stringContaining(
          `Error extracting job name from workflow file, falling back to "test-job"`
        )
      );
      expect(result).toBe("test-job");
    });
  });

  describe("when checkRunId is not available", () => {
    beforeEach(() => {
      mockSanitizedInputs.checkRunId = undefined;
    });

    it("should use workflow file to get the check name", async () => {
      const mockWorkflowContent = `
jobs:
  test-job:
    name: "Custom Job Name"
    steps: []
`;
      const encodedContent =
        Buffer.from(mockWorkflowContent).toString("base64");

      mockRestClient.repos.getContent.mockResolvedValue({
        data: {
          content: encodedContent,
        },
      });

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockRestClient.repos.getContent).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        path: ".github/workflows/test.yml",
        ref: "test-sha",
      });
      expect(mockCore.debug).toHaveBeenCalledWith(
        "Extracted check name from workflow file: Custom Job Name"
      );
      expect(result).toBe("Custom Job Name");
    });

    it("should fall back to job name when workflow job has no custom name", async () => {
      const mockWorkflowContent = `
jobs:
  test-job:
    steps: []
`;
      const encodedContent =
        Buffer.from(mockWorkflowContent).toString("base64");

      mockRestClient.repos.getContent.mockResolvedValue({
        data: {
          content: encodedContent,
        },
      });

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockCore.debug).toHaveBeenCalledWith(
        "Extracted check name from workflow file: test-job"
      );
      expect(result).toBe("test-job");
    });

    it("should not call checks.get when checkRunId is not available", async () => {
      const mockWorkflowContent = `
jobs:
  test-job:
    name: "Custom Job Name"
    steps: []
`;
      const encodedContent =
        Buffer.from(mockWorkflowContent).toString("base64");

      mockRestClient.repos.getContent.mockResolvedValue({
        data: {
          content: encodedContent,
        },
      });

      await extractOwnCheckNameFromWorkflow();

      expect(mockRestClient.checks.get).not.toHaveBeenCalled();
    });

    it("should handle errors from workflow file parsing and fall back to job name", async () => {
      const errorMessage = "File not found";
      mockRestClient.repos.getContent.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockCore.warning).toHaveBeenCalledWith(
        expect.stringContaining(
          `Error extracting job name from workflow file, falling back to "test-job"`
        )
      );
      expect(result).toBe("test-job");
    });
  });

  describe("edge cases", () => {
    it("should handle missing GITHUB_JOB environment variable", async () => {
      const originalJob = process.env.GITHUB_JOB;
      delete process.env.GITHUB_JOB;

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockCore.warning).toHaveBeenCalled();
      expect(result).toBe(undefined);

      // Restore original value
      if (originalJob !== undefined) {
        process.env.GITHUB_JOB = originalJob;
      }
    });

    it("should handle invalid GITHUB_WORKFLOW_REF", async () => {
      process.env.GITHUB_WORKFLOW_REF = "invalid-ref";

      const result = await extractOwnCheckNameFromWorkflow();

      expect(mockCore.warning).toHaveBeenCalled();
      expect(result).toBe("test-job");
    });
  });
});
