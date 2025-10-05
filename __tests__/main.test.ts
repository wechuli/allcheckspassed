/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from "@actions/core";
import * as github from "@actions/github";
import * as main from "../src/main";
import Checks from "../src/checks/checks";
import * as timeFuncs from "../src/utils/timeFuncs";

// Mock the inputsExtractor module before importing
jest.mock("../src/utils/inputsExtractor", () => ({
  sanitizedInputs: {
    commitSHA: "abc123",
    checksExclude: [],
    checksInclude: [],
    treatSkippedAsPassed: true,
    treatNeutralAsPassed: true,
    failFast: true,
    failStep: true,
    failOnMissingChecks: false,
    poll: false,
    pollingInterval: 1,
    retries: 3,
    verbose: false,
    showJobSummary: false,
    delay: 0,
    checkRunId: undefined,
    includeStatusCommits: false,
  },
}));

// Mock dependencies
jest.mock("../src/checks/checks");
jest.mock("../src/utils/timeFuncs");

// Import the mocked value
import { sanitizedInputs } from "../src/utils/inputsExtractor";
const mockSanitizedInputs = sanitizedInputs as any;

describe("action", () => {
  // Mock core functions
  let infoMock: jest.SpyInstance;
  let setFailedMock: jest.SpyInstance;

  // Mock other functions
  let sleepMock: jest.SpyInstance;
  let ChecksRunMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock core functions
    infoMock = jest.spyOn(core, "info").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();

    // Mock sleep
    sleepMock = jest.spyOn(timeFuncs, "sleep").mockResolvedValue();

    // Mock github context
    Object.defineProperty(github, "context", {
      value: {
        repo: {
          owner: "testOwner",
          repo: "testRepo",
        },
      },
      configurable: true,
    });

    // Mock Checks class
    ChecksRunMock = jest.fn().mockResolvedValue(undefined);
    (Checks as jest.MockedClass<typeof Checks>).mockImplementation(
      () =>
        ({
          run: ChecksRunMock,
        } as any)
    );
  });

  it("should run successfully with default inputs", async () => {
    await main.run();

    expect(infoMock).toHaveBeenCalledWith("Validating checks, standby...");
    expect(sleepMock).toHaveBeenCalledWith(0); // delay * 1000 * 60 = 0
    expect(Checks).toHaveBeenCalledWith({
      ...mockSanitizedInputs,
      owner: "testOwner",
      repo: "testRepo",
    });
    expect(ChecksRunMock).toHaveBeenCalled();
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should call sleep with correct delay value", async () => {
    // Update the mock for this test
    mockSanitizedInputs.delay = 2;

    await main.run();

    expect(sleepMock).toHaveBeenCalledWith(2 * 1000 * 60); // 2 minutes in ms

    // Reset for other tests
    mockSanitizedInputs.delay = 0;
  });

  it("should create Checks instance with correct parameters", async () => {
    await main.run();

    expect(Checks).toHaveBeenCalledWith({
      ...mockSanitizedInputs,
      owner: "testOwner",
      repo: "testRepo",
    });
  });

  it("should call setFailed when an error occurs", async () => {
    const errorMessage = "Test error";
    ChecksRunMock.mockRejectedValueOnce(new Error(errorMessage));

    await main.run();

    expect(setFailedMock).toHaveBeenCalledWith(errorMessage);
  });

  it("should handle non-Error exceptions gracefully", async () => {
    ChecksRunMock.mockRejectedValueOnce("String error");

    await main.run();

    // Should not throw, but setFailed won't be called for non-Error types
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should use github context for owner and repo", async () => {
    Object.defineProperty(github, "context", {
      value: {
        repo: {
          owner: "customOwner",
          repo: "customRepo",
        },
      },
      configurable: true,
    });

    await main.run();

    expect(Checks).toHaveBeenCalledWith({
      ...mockSanitizedInputs,
      owner: "customOwner",
      repo: "customRepo",
    });
  });

  it("should pass all sanitized inputs to Checks", async () => {
    // Update the mock for this test
    mockSanitizedInputs.poll = true;
    mockSanitizedInputs.verbose = true;
    mockSanitizedInputs.failFast = false;
    mockSanitizedInputs.retries = 5;

    await main.run();

    expect(Checks).toHaveBeenCalledWith({
      ...mockSanitizedInputs,
      owner: "testOwner",
      repo: "testRepo",
    });

    // Reset for other tests
    mockSanitizedInputs.poll = false;
    mockSanitizedInputs.verbose = false;
    mockSanitizedInputs.failFast = true;
    mockSanitizedInputs.retries = 3;
  });
});
