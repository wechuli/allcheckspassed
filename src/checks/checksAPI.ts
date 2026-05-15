import { restClient } from "../utils/octokit";
import { ICheck, IWorkflowRun } from "./checksInterfaces";

export async function getAllChecks(
  owner: string,
  repo: string,
  ref: string
): Promise<ICheck[]> {
  try {
    let checks = await restClient.paginate(
      "GET /repos/:owner/:repo/commits/:ref/check-runs",
      {
        owner,
        repo,
        ref,
      }
    );
    return checks as ICheck[];
  } catch (error: any) {
    throw new Error("Error getting all checks: " + error.message);
  }
}

export async function getWorkflowRunsForCommit(
  owner: string,
  repo: string,
  headSha: string
): Promise<IWorkflowRun[]> {
  try {
    let runs = await restClient.paginate(
      "GET /repos/:owner/:repo/actions/runs",
      {
        owner,
        repo,
        head_sha: headSha,
      }
    );
    return (runs as any[]).map((run) => ({
      id: run.id,
      workflow_id: run.workflow_id,
      check_suite_id: run.check_suite_id,
    }));
  } catch (error: any) {
    throw new Error(
      "Error getting workflow runs for commit: " + error.message
    );
  }
}
