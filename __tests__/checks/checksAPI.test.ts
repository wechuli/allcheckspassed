import { getAllChecks } from "../../src/checks/checksAPI";
import * as octokitModule from "../../src/utils/octokit";
import { ICheck } from "../../src/checks/checksInterfaces";
import { checkStatus, checkConclusion } from "../../src/checks/checksConstants";

// Mock the octokit module
jest.mock("../../src/utils/octokit");

describe("checksAPI", () => {
  let paginateMock: jest.SpyInstance;

  const mockChecks: ICheck[] = [
    {
      id: 1,
      name: "test-check-1",
      status: checkStatus.COMPLETED,
      conclusion: checkConclusion.SUCCESS,
      started_at: "2022-01-01T00:00:00Z",
      completed_at: "2022-01-01T00:01:00Z",
      check_suite: { id: 101 },
      app: { id: 1001, slug: "github-actions", name: "GitHub Actions" },
    },
    {
      id: 2,
      name: "test-check-2",
      status: checkStatus.COMPLETED,
      conclusion: checkConclusion.FAILURE,
      started_at: "2022-01-01T00:00:00Z",
      completed_at: "2022-01-01T00:01:00Z",
      check_suite: { id: 102 },
      app: { id: 1002, slug: "some-app", name: "Some App" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup paginate mock
    paginateMock = jest.spyOn(octokitModule.restClient, "paginate");
  });

  describe("getAllChecks", () => {
    it("should fetch all checks for a commit", async () => {
      paginateMock.mockResolvedValue(mockChecks);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/check-runs",
        {
          owner: "owner",
          repo: "repo",
          ref: "abc123",
        }
      );
      expect(result).toEqual(mockChecks);
    });

    it("should return empty array when no checks exist", async () => {
      paginateMock.mockResolvedValue([]);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(result).toEqual([]);
    });

    it("should handle pagination correctly", async () => {
      const manyChecks: ICheck[] = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        name: `check-${i}`,
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.SUCCESS,
        started_at: "2022-01-01T00:00:00Z",
        completed_at: "2022-01-01T00:01:00Z",
        check_suite: { id: 100 + i },
        app: { id: 1000 + i, slug: "app", name: "App" },
      }));

      paginateMock.mockResolvedValue(manyChecks);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(result).toHaveLength(150);
      expect(paginateMock).toHaveBeenCalledTimes(1);
    });

    it("should throw error when API call fails", async () => {
      paginateMock.mockRejectedValue(new Error("API Error"));

      await expect(getAllChecks("owner", "repo", "abc123")).rejects.toThrow(
        "Error getting all checks: API Error"
      );
    });

    it("should handle network timeout errors", async () => {
      paginateMock.mockRejectedValue(new Error("Network timeout"));

      await expect(getAllChecks("owner", "repo", "abc123")).rejects.toThrow(
        "Error getting all checks: Network timeout"
      );
    });

    it("should handle 404 errors", async () => {
      paginateMock.mockRejectedValue(new Error("Not Found"));

      await expect(
        getAllChecks("owner", "repo", "invalid-ref")
      ).rejects.toThrow("Error getting all checks: Not Found");
    });

    it("should call API with correct parameters for different refs", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllChecks("myorg", "myrepo", "feature-branch");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/check-runs",
        {
          owner: "myorg",
          repo: "myrepo",
          ref: "feature-branch",
        }
      );
    });

    it("should handle SHA refs", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllChecks(
        "owner",
        "repo",
        "a1b2c3d4e5f6789012345678901234567890abcd"
      );

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/check-runs",
        {
          owner: "owner",
          repo: "repo",
          ref: "a1b2c3d4e5f6789012345678901234567890abcd",
        }
      );
    });

    it("should preserve all check fields from API response", async () => {
      const mockCheck: ICheck = {
        id: 12345,
        name: "comprehensive-check",
        status: checkStatus.IN_PROGRESS,
        conclusion: null,
        started_at: "2022-01-01T00:00:00Z",
        completed_at: null,
        check_suite: { id: 999 },
        app: { id: 5000, slug: "test-app", name: "Test App" },
      };

      paginateMock.mockResolvedValue([mockCheck]);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(result[0]).toEqual(mockCheck);
      expect(result[0].id).toBe(12345);
      expect(result[0].name).toBe("comprehensive-check");
      expect(result[0].status).toBe(checkStatus.IN_PROGRESS);
      expect(result[0].conclusion).toBeNull();
      expect(result[0].app.slug).toBe("test-app");
    });

    it("should handle special characters in owner and repo names", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllChecks("org-name", "repo.name", "main");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/check-runs",
        {
          owner: "org-name",
          repo: "repo.name",
          ref: "main",
        }
      );
    });

    it("should handle checks with different statuses", async () => {
      const checksWithVariousStatuses: ICheck[] = [
        {
          id: 1,
          name: "queued-check",
          status: checkStatus.QUEUED,
          conclusion: null,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: null,
          check_suite: { id: 1 },
          app: { id: 1, slug: "app", name: "App" },
        },
        {
          id: 2,
          name: "in-progress-check",
          status: checkStatus.IN_PROGRESS,
          conclusion: null,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: null,
          check_suite: { id: 2 },
          app: { id: 2, slug: "app", name: "App" },
        },
        {
          id: 3,
          name: "completed-check",
          status: checkStatus.COMPLETED,
          conclusion: checkConclusion.SUCCESS,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: "2022-01-01T00:01:00Z",
          check_suite: { id: 3 },
          app: { id: 3, slug: "app", name: "App" },
        },
      ];

      paginateMock.mockResolvedValue(checksWithVariousStatuses);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(checkStatus.QUEUED);
      expect(result[1].status).toBe(checkStatus.IN_PROGRESS);
      expect(result[2].status).toBe(checkStatus.COMPLETED);
    });

    it("should handle checks with different conclusions", async () => {
      const checksWithVariousConclusions: ICheck[] = [
        {
          id: 1,
          name: "success-check",
          status: checkStatus.COMPLETED,
          conclusion: checkConclusion.SUCCESS,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: "2022-01-01T00:01:00Z",
          check_suite: { id: 1 },
          app: { id: 1, slug: "app", name: "App" },
        },
        {
          id: 2,
          name: "failure-check",
          status: checkStatus.COMPLETED,
          conclusion: checkConclusion.FAILURE,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: "2022-01-01T00:01:00Z",
          check_suite: { id: 2 },
          app: { id: 2, slug: "app", name: "App" },
        },
        {
          id: 3,
          name: "skipped-check",
          status: checkStatus.COMPLETED,
          conclusion: checkConclusion.SKIPPED,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: "2022-01-01T00:01:00Z",
          check_suite: { id: 3 },
          app: { id: 3, slug: "app", name: "App" },
        },
        {
          id: 4,
          name: "neutral-check",
          status: checkStatus.COMPLETED,
          conclusion: checkConclusion.NEUTRAL,
          started_at: "2022-01-01T00:00:00Z",
          completed_at: "2022-01-01T00:01:00Z",
          check_suite: { id: 4 },
          app: { id: 4, slug: "app", name: "App" },
        },
      ];

      paginateMock.mockResolvedValue(checksWithVariousConclusions);

      const result = await getAllChecks("owner", "repo", "abc123");

      expect(result).toHaveLength(4);
      expect(result[0].conclusion).toBe(checkConclusion.SUCCESS);
      expect(result[1].conclusion).toBe(checkConclusion.FAILURE);
      expect(result[2].conclusion).toBe(checkConclusion.SKIPPED);
      expect(result[3].conclusion).toBe(checkConclusion.NEUTRAL);
    });
  });
});
