import {
  getMostRecentStatusPerContextAndCreator,
} from "../../src/statuses/statusesFilters";
import { IStatus } from "../../src/statuses/statusesInterfaces";

describe("statusesFilters", () => {
  const sampleStatuses: IStatus[] = [
    {
      id: 39672993325,
      context: "continuous-integration/jenkins",
      state: "failure",
      created_at: "2025-09-30T14:20:08Z",
      updated_at: "2025-09-30T14:20:08Z",
      creator: {
        login: "wechuli",
        id: 15605874,
      },
    },
    {
      id: 39672979662,
      context: "continuous-integration/jenkins",
      state: "pending",
      created_at: "2025-09-30T14:19:47Z",
      updated_at: "2025-09-30T14:19:47Z",
      creator: {
        login: "wechuli",
        id: 15605874,
      },
    },
    {
      id: 39672962369,
      context: "continuous-integration/jenkins",
      state: "success",
      created_at: "2025-09-30T14:19:21Z",
      updated_at: "2025-09-30T14:19:21Z",
      creator: {
        login: "wechgithubapp[bot]",
        id: 83030253,
      },
    },
    {
      id: 39672938945,
      context: "continuous-integration/jenkins",
      state: "pending",
      created_at: "2025-09-30T14:18:46Z",
      updated_at: "2025-09-30T14:18:46Z",
      creator: {
        login: "wechgithubapp[bot]",
        id: 83030253,
      },
    },
  ];

  describe("getMostRecentStatusPerContextAndCreator", () => {
    it("should return the status with highest ID for each context/creator combination", () => {
      const result = getMostRecentStatusPerContextAndCreator(sampleStatuses);

      expect(result).toHaveLength(2);

      // Should include the highest ID for wechuli
      const wechuliStatus = result.find((s) => s.creator.login === "wechuli");
      expect(wechuliStatus).toBeDefined();
      expect(wechuliStatus?.id).toBe(39672993325);
      expect(wechuliStatus?.state).toBe("failure");

      // Should include the highest ID for wechgithubapp[bot]
      const botStatus = result.find(
        (s) => s.creator.login === "wechgithubapp[bot]"
      );
      expect(botStatus).toBeDefined();
      expect(botStatus?.id).toBe(39672962369);
      expect(botStatus?.state).toBe("success");
    });

    it("should handle empty array", () => {
      const result = getMostRecentStatusPerContextAndCreator([]);
      expect(result).toEqual([]);
    });

    it("should handle single status", () => {
      const result = getMostRecentStatusPerContextAndCreator([
        sampleStatuses[0],
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleStatuses[0]);
    });

    it("should handle different contexts for same creator", () => {
      const statuses: IStatus[] = [
        {
          id: 100,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:20:08Z",
          creator: { login: "user1", id: 1 },
        },
        {
          id: 101,
          context: "ci/build",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:20:08Z",
          creator: { login: "user1", id: 1 },
        },
      ];

      const result = getMostRecentStatusPerContextAndCreator(statuses);
      expect(result).toHaveLength(2); // Both should be included (different contexts)
    });

    it("should handle same context for different creators", () => {
      const statuses: IStatus[] = [
        {
          id: 100,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:20:08Z",
          creator: { login: "user1", id: 1 },
        },
        {
          id: 101,
          context: "ci/test",
          state: "success",
          created_at: "2025-09-30T14:20:08Z",
          updated_at: "2025-09-30T14:20:08Z",
          creator: { login: "user2", id: 2 },
        },
      ];

      const result = getMostRecentStatusPerContextAndCreator(statuses);
      expect(result).toHaveLength(2); // Both should be included (different creators)
    });
  });

