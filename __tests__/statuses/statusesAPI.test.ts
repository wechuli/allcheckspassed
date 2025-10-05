import { getAllStatusCommits } from "../../src/statuses/statusesAPI";
import * as octokitModule from "../../src/utils/octokit";
import { IStatus } from "../../src/statuses/statusesInterfaces";

// Mock the octokit client
jest.mock("../../src/utils/octokit");

describe("statusesAPI", () => {
  let paginateMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    paginateMock = jest.spyOn(octokitModule.restClient, "paginate");
  });

  describe("getAllStatusCommits", () => {
    it("should fetch all status commits for a ref", async () => {
      const mockStatuses: IStatus[] = [
        {
          id: 1,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
        {
          id: 2,
          context: "ci/build",
          state: "failure",
          created_at: "2025-09-30T14:20:09Z",
          updated_at: "2025-09-30T14:21:09Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      paginateMock.mockResolvedValue(mockStatuses);

      const result = await getAllStatusCommits("owner", "repo", "abc123");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/statuses",
        {
          owner: "owner",
          repo: "repo",
          ref: "abc123",
        }
      );
      expect(result).toEqual(mockStatuses);
    });

    it("should return empty array when no statuses exist", async () => {
      paginateMock.mockResolvedValue([]);

      const result = await getAllStatusCommits("owner", "repo", "abc123");

      expect(result).toEqual([]);
    });

    it("should handle pagination correctly", async () => {
      const mockStatuses: IStatus[] = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        context: `ci/test-${i}`,
        state: "success",
        created_at: "2025-09-30T14:20:08Z",
        updated_at: "2025-09-30T14:21:08Z",
        creator: {
          login: "testuser",
          id: 123,
        },
      }));

      paginateMock.mockResolvedValue(mockStatuses);

      const result = await getAllStatusCommits("owner", "repo", "abc123");

      expect(result).toHaveLength(150);
      expect(paginateMock).toHaveBeenCalledTimes(1);
    });

    it("should throw error when API call fails", async () => {
      paginateMock.mockRejectedValue(new Error("API Error"));

      await expect(
        getAllStatusCommits("owner", "repo", "abc123")
      ).rejects.toThrow("Error getting all statuses: API Error");
    });

    it("should handle network timeout errors", async () => {
      paginateMock.mockRejectedValue(new Error("Network timeout"));

      await expect(
        getAllStatusCommits("owner", "repo", "abc123")
      ).rejects.toThrow("Error getting all statuses: Network timeout");
    });

    it("should handle 404 errors", async () => {
      paginateMock.mockRejectedValue(new Error("Not Found"));

      await expect(
        getAllStatusCommits("owner", "repo", "invalid-ref")
      ).rejects.toThrow("Error getting all statuses: Not Found");
    });

    it("should call API with correct parameters for different refs", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllStatusCommits("myorg", "myrepo", "feature-branch");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/statuses",
        {
          owner: "myorg",
          repo: "myrepo",
          ref: "feature-branch",
        }
      );
    });

    it("should handle SHA refs", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllStatusCommits(
        "owner",
        "repo",
        "a1b2c3d4e5f6789012345678901234567890abcd"
      );

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/statuses",
        {
          owner: "owner",
          repo: "repo",
          ref: "a1b2c3d4e5f6789012345678901234567890abcd",
        }
      );
    });

    it("should preserve all status fields from API response", async () => {
      const mockStatus: IStatus = {
        id: 39672993325,
        context: "continuous-integration/jenkins",
        state: "failure",
        created_at: "2025-09-30T14:20:08Z",
        updated_at: "2025-09-30T14:20:08Z",
        creator: {
          login: "wechuli",
          id: 15605874,
        },
      };

      paginateMock.mockResolvedValue([mockStatus]);

      const result = await getAllStatusCommits("owner", "repo", "abc123");

      expect(result[0]).toEqual(mockStatus);
      expect(result[0].id).toBe(39672993325);
      expect(result[0].context).toBe("continuous-integration/jenkins");
      expect(result[0].state).toBe("failure");
      expect(result[0].creator.login).toBe("wechuli");
    });

    it("should handle special characters in owner and repo names", async () => {
      paginateMock.mockResolvedValue([]);

      await getAllStatusCommits("org-name", "repo.name", "main");

      expect(paginateMock).toHaveBeenCalledWith(
        "GET /repos/:owner/:repo/commits/:ref/statuses",
        {
          owner: "org-name",
          repo: "repo.name",
          ref: "main",
        }
      );
    });
  });
});
