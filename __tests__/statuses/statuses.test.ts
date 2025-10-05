import { mapStatusesToChecksModel } from "../../src/statuses/statuses";
import { IStatus } from "../../src/statuses/statusesInterfaces";
import { ICheck } from "../../src/checks/checksInterfaces";

describe("statuses", () => {
  describe("mapStatusesToChecksModel", () => {
    it("should map success status to check model", () => {
      const statuses: IStatus[] = [
        {
          id: 12345,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 12345,
        name: "ci/test",
        status: "completed",
        conclusion: "success",
        started_at: "2025-09-30T14:20:08Z",
        completed_at: "2025-09-30T14:21:08Z",
        check_suite: {
          id: 0,
        },
        app: {
          id: 123,
          slug: "testuser",
          name: "testuser",
        },
        commit_status: statuses[0],
      });
    });

    it("should map failure status to check model", () => {
      const statuses: IStatus[] = [
        {
          id: 12346,
          context: "ci/build",
          state: "failure",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("completed");
      expect(result[0].conclusion).toBe("failure");
      expect(result[0].completed_at).toBe("2025-09-30T14:21:08Z");
    });

    it("should map pending status to check model", () => {
      const statuses: IStatus[] = [
        {
          id: 12347,
          context: "ci/lint",
          state: "pending",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("in_progress");
      expect(result[0].conclusion).toBe(null);
      expect(result[0].completed_at).toBe(null);
    });

    it("should map error status to check model with failure conclusion", () => {
      const statuses: IStatus[] = [
        {
          id: 12348,
          context: "ci/deploy",
          state: "error",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("completed");
      expect(result[0].conclusion).toBe("failure");
      expect(result[0].completed_at).toBe("2025-09-30T14:21:08Z");
    });

    it("should map multiple statuses correctly", () => {
      const statuses: IStatus[] = [
        {
          id: 1,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "user1",
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
            login: "user2",
            id: 456,
          },
        },
        {
          id: 3,
          context: "ci/lint",
          state: "pending",
          created_at: "2025-09-30T14:20:10Z",
          updated_at: "2025-09-30T14:21:10Z",
          creator: {
            login: "user3",
            id: 789,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it("should preserve original status in commit_status field", () => {
      const statuses: IStatus[] = [
        {
          id: 12345,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "testuser",
            id: 123,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].commit_status).toBeDefined();
      expect(result[0].commit_status).toEqual(statuses[0]);
      expect(result[0].commit_status?.id).toBe(12345);
      expect(result[0].commit_status?.state).toBe("success");
    });

    it("should handle empty array", () => {
      const result = mapStatusesToChecksModel([]);
      expect(result).toEqual([]);
    });

    it("should use context as check name", () => {
      const statuses: IStatus[] = [
        {
          id: 1,
          context: "continuous-integration/jenkins",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "jenkins-bot",
            id: 999,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].name).toBe("continuous-integration/jenkins");
    });

    it("should use creator info for app fields", () => {
      const statuses: IStatus[] = [
        {
          id: 1,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: {
            login: "github-actions[bot]",
            id: 41898282,
          },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].app).toEqual({
        id: 41898282,
        slug: "github-actions[bot]",
        name: "github-actions[bot]",
      });
    });

    it("should set check_suite.id to 0 for all statuses", () => {
      const statuses: IStatus[] = [
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
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].check_suite.id).toBe(0);
    });

    it("should use created_at for started_at", () => {
      const statuses: IStatus[] = [
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
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].started_at).toBe("2025-09-30T14:20:08Z");
    });

    it("should map all possible state values correctly", () => {
      const statuses: IStatus[] = [
        {
          id: 1,
          context: "ci/test-success",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: { login: "user", id: 1 },
        },
        {
          id: 2,
          context: "ci/test-failure",
          state: "failure",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: { login: "user", id: 1 },
        },
        {
          id: 3,
          context: "ci/test-error",
          state: "error",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: { login: "user", id: 1 },
        },
        {
          id: 4,
          context: "ci/test-pending",
          state: "pending",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:21:08Z",
          creator: { login: "user", id: 1 },
        },
      ];

      const result = mapStatusesToChecksModel(statuses);

      expect(result[0].status).toBe("completed");
      expect(result[0].conclusion).toBe("success");

      expect(result[1].status).toBe("completed");
      expect(result[1].conclusion).toBe("failure");

      expect(result[2].status).toBe("completed");
      expect(result[2].conclusion).toBe("failure");

      expect(result[3].status).toBe("in_progress");
      expect(result[3].conclusion).toBe(null);
    });
  });
});
