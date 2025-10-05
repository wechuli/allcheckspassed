import { sleep } from "../../src/utils/timeFuncs";

describe("timeFuncs", () => {
  describe("sleep", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should resolve after the specified time", async () => {
      const promise = sleep(1000);

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should wait for 0 milliseconds", async () => {
      const promise = sleep(0);

      jest.advanceTimersByTime(0);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should wait for large time values", async () => {
      const promise = sleep(60000); // 1 minute

      jest.advanceTimersByTime(60000);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should not resolve before the specified time", async () => {
      const promise = sleep(1000);
      let resolved = false;

      promise.then(() => {
        resolved = true;
      });

      // Only advance 500ms
      jest.advanceTimersByTime(500);

      // Wait for any pending promises
      await Promise.resolve();

      expect(resolved).toBe(false);

      // Now advance the remaining time
      jest.advanceTimersByTime(500);

      await promise;

      expect(resolved).toBe(true);
    });

    it("should handle fractional milliseconds", async () => {
      const promise = sleep(100.5);

      jest.advanceTimersByTime(101);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should work with multiple concurrent sleeps", async () => {
      const promise1 = sleep(500);
      const promise2 = sleep(1000);
      const promise3 = sleep(1500);

      jest.advanceTimersByTime(1500);

      await expect(Promise.all([promise1, promise2, promise3])).resolves.toEqual(
        [undefined, undefined, undefined]
      );
    });

    it("should resolve in the correct order for different durations", async () => {
      const results: number[] = [];

      const promise1 = sleep(100).then(() => results.push(1));
      const promise2 = sleep(200).then(() => results.push(2));
      const promise3 = sleep(300).then(() => results.push(3));

      // Run all timers to completion
      jest.runAllTimers();
      
      await Promise.all([promise1, promise2, promise3]);

      expect(results).toEqual([1, 2, 3]);
    });

    it("should return a Promise", () => {
      const result = sleep(100);

      expect(result).toBeInstanceOf(Promise);
    });

    it("should resolve to undefined", async () => {
      const promise = sleep(100);

      jest.advanceTimersByTime(100);

      const result = await promise;

      expect(result).toBeUndefined();
    });
  });
});
