import { filterSupersededWorkflowRunChecks } from "../../../src/checks/checksFilters";
import { ICheck, IWorkflowRun } from "../../../src/checks/checksInterfaces";
import {
  checkConclusion,
  checkStatus,
} from "../../../src/checks/checksConstants";

function makeCheck(overrides: Partial<ICheck> & { id: number }): ICheck {
  return {
    name: "job",
    status: checkStatus.COMPLETED,
    conclusion: checkConclusion.SUCCESS,
    started_at: "2024-01-01T00:00:00Z",
    completed_at: "2024-01-01T00:01:00Z",
    check_suite: { id: 100 },
    app: { id: 1, slug: "github-actions", name: "GitHub Actions" },
    ...overrides,
  };
}

function makeWorkflowRun(
  overrides: Partial<IWorkflowRun> & { id: number }
): IWorkflowRun {
  return {
    workflow_id: 1,
    check_suite_id: 100,
    ...overrides,
  };
}

describe("filterSupersededWorkflowRunChecks", () => {
  it("should return all checks when workflowRuns is empty", () => {
    const checks = [makeCheck({ id: 1 }), makeCheck({ id: 2 })];

    const result = filterSupersededWorkflowRunChecks(checks, []);

    expect(result).toEqual(checks);
  });

  it("should return all checks when each workflow has only one run", () => {
    const checks = [
      makeCheck({ id: 1, check_suite: { id: 500 } }),
      makeCheck({ id: 2, check_suite: { id: 600 } }),
    ];
    const workflowRuns = [
      makeWorkflowRun({ id: 100, workflow_id: 10, check_suite_id: 500 }),
      makeWorkflowRun({ id: 200, workflow_id: 20, check_suite_id: 600 }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toEqual(checks);
  });

  it("should filter out checks from a superseded run when same workflow has two runs", () => {
    const supersededCheck = makeCheck({
      id: 1,
      name: "build",
      check_suite: { id: 500 },
      conclusion: checkConclusion.FAILURE,
    });
    const latestCheck = makeCheck({
      id: 2,
      name: "build",
      check_suite: { id: 600 },
      conclusion: checkConclusion.SUCCESS,
    });
    const checks = [supersededCheck, latestCheck];

    const workflowRuns = [
      makeWorkflowRun({ id: 100, workflow_id: 10, check_suite_id: 500 }),
      makeWorkflowRun({ id: 200, workflow_id: 10, check_suite_id: 600 }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toEqual([latestCheck]);
  });

  it("should keep checks from latest run per workflow when multiple workflows exist", () => {
    const checks = [
      makeCheck({ id: 1, name: "build", check_suite: { id: 500 } }),
      makeCheck({ id: 2, name: "build", check_suite: { id: 600 } }),
      makeCheck({ id: 3, name: "lint", check_suite: { id: 700 } }),
      makeCheck({ id: 4, name: "lint", check_suite: { id: 800 } }),
    ];
    const workflowRuns = [
      makeWorkflowRun({ id: 100, workflow_id: 10, check_suite_id: 500 }),
      makeWorkflowRun({ id: 200, workflow_id: 10, check_suite_id: 600 }),
      makeWorkflowRun({ id: 300, workflow_id: 20, check_suite_id: 700 }),
      makeWorkflowRun({ id: 400, workflow_id: 20, check_suite_id: 800 }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(
      expect.objectContaining({ id: 2, check_suite: { id: 600 } })
    );
    expect(result).toContainEqual(
      expect.objectContaining({ id: 4, check_suite: { id: 800 } })
    );
  });

  it("should keep checks from non-GitHub-Actions apps whose suite ID is not in any workflow run", () => {
    const ghActionsCheck = makeCheck({
      id: 1,
      name: "build",
      check_suite: { id: 500 },
    });
    const thirdPartyCheck = makeCheck({
      id: 2,
      name: "codecov",
      check_suite: { id: 999 },
      app: { id: 50, slug: "codecov", name: "Codecov" },
    });
    const checks = [ghActionsCheck, thirdPartyCheck];

    const workflowRuns = [
      makeWorkflowRun({ id: 100, workflow_id: 10, check_suite_id: 500 }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toEqual(checks);
  });

  it("should handle issue #104: re-run check has higher ID but belongs to superseded run", () => {
    const rerunCheck = makeCheck({
      id: 5000,
      name: "E2E Tests",
      check_suite: { id: 900 },
      conclusion: checkConclusion.FAILURE,
    });
    const freshCheck = makeCheck({
      id: 4999,
      name: "E2E Tests",
      check_suite: { id: 901 },
      conclusion: checkConclusion.SUCCESS,
    });
    const checks = [rerunCheck, freshCheck];

    const workflowRuns = [
      makeWorkflowRun({
        id: 100,
        workflow_id: 50,
        check_suite_id: 900,
      }),
      makeWorkflowRun({
        id: 200,
        workflow_id: 50,
        check_suite_id: 901,
      }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toEqual([freshCheck]);
    expect(result).not.toContainEqual(
      expect.objectContaining({ conclusion: checkConclusion.FAILURE })
    );
  });

  it("should only filter superseded workflows, leaving others unaffected", () => {
    const supersededCheck = makeCheck({
      id: 1,
      name: "build",
      check_suite: { id: 500 },
      conclusion: checkConclusion.FAILURE,
    });
    const latestCheck = makeCheck({
      id: 2,
      name: "build",
      check_suite: { id: 600 },
      conclusion: checkConclusion.SUCCESS,
    });
    const unrelatedCheck = makeCheck({
      id: 3,
      name: "deploy",
      check_suite: { id: 700 },
    });
    const checks = [supersededCheck, latestCheck, unrelatedCheck];

    const workflowRuns = [
      makeWorkflowRun({ id: 100, workflow_id: 10, check_suite_id: 500 }),
      makeWorkflowRun({ id: 200, workflow_id: 10, check_suite_id: 600 }),
      makeWorkflowRun({ id: 300, workflow_id: 20, check_suite_id: 700 }),
    ];

    const result = filterSupersededWorkflowRunChecks(checks, workflowRuns);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(expect.objectContaining({ id: 2 }));
    expect(result).toContainEqual(expect.objectContaining({ id: 3 }));
    expect(result).not.toContainEqual(expect.objectContaining({ id: 1 }));
  });
});
