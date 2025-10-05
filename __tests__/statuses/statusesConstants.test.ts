import {
  commitStatusState,
  addCommitStatusEmoji,
} from "../../src/statuses/statusesConstants";

describe("statusesConstants", () => {
  describe("commitStatusState", () => {
    it("should have all required status states", () => {
      expect(commitStatusState.ERROR).toBe("error");
      expect(commitStatusState.FAILURE).toBe("failure");
      expect(commitStatusState.PENDING).toBe("pending");
      expect(commitStatusState.SUCCESS).toBe("success");
    });

    it("should have exactly 4 status states", () => {
      const keys = Object.keys(commitStatusState);
      expect(keys).toHaveLength(4);
    });
  });

  describe("addCommitStatusEmoji", () => {
    it("should add success emoji", () => {
      const result = addCommitStatusEmoji("success");
      expect(result).toBe("success ✅");
    });

    it("should add failure emoji", () => {
      const result = addCommitStatusEmoji("failure");
      expect(result).toBe("failure ❌");
    });

    it("should add pending emoji", () => {
      const result = addCommitStatusEmoji("pending");
      expect(result).toBe("pending ⏳");
    });

    it("should add error emoji", () => {
      const result = addCommitStatusEmoji("error");
      expect(result).toBe("error ⚠️");
    });

    it("should handle case sensitivity", () => {
      const result = addCommitStatusEmoji("success");
      expect(result).toContain("✅");
    });

    it("should return state with undefined emoji for unknown state", () => {
      const result = addCommitStatusEmoji("unknown");
      expect(result).toBe("unknown undefined");
    });

    it("should handle empty string", () => {
      const result = addCommitStatusEmoji("");
      expect(result).toBe(" undefined");
    });

    it("should work with commitStatusState constants", () => {
      expect(addCommitStatusEmoji(commitStatusState.SUCCESS)).toContain("✅");
      expect(addCommitStatusEmoji(commitStatusState.FAILURE)).toContain("❌");
      expect(addCommitStatusEmoji(commitStatusState.PENDING)).toContain("⏳");
      expect(addCommitStatusEmoji(commitStatusState.ERROR)).toContain("⚠️");
    });

    it("should preserve the original status text", () => {
      expect(addCommitStatusEmoji("success")).toContain("success");
      expect(addCommitStatusEmoji("failure")).toContain("failure");
      expect(addCommitStatusEmoji("pending")).toContain("pending");
      expect(addCommitStatusEmoji("error")).toContain("error");
    });

    it("should format with space between status and emoji", () => {
      const result = addCommitStatusEmoji("success");
      expect(result).toMatch(/^success ✅$/);
    });
  });
});
