import {restClient} from "../utils/octokit";



export async function getAllChecks(owner: string, repo: string, ref: string) {
    try {
        let checks = await restClient.paginate(
            "GET /repos/:owner/:repo/commits/:ref/check-runs",
            {
                owner,
                repo,
                ref,
            }
        );
        return checks;
    } catch (error: any) {
        throw new Error("Error getting all checks: " + error.message);
    }
}

export async function getAllStatusCommits(
    owner: string,
    repo: string,
    ref: string
) {
    try {
        let statuses = await restClient.paginate(
            "GET /repos/:owner/:repo/commits/:ref/statuses",
            {
                owner,
                repo,
                ref,
            }
        );
        return statuses;
    } catch (error: any) {
        throw new Error("Error getting all statuses: " + error.message);
    }
}

export async function getJobsForWorkflowRun(
    owner: string,
    repo: string,
    run_id: number
) {
    try {
        let jobs = await restClient.paginate(
            "GET /repos/:owner/:repo/actions/runs/:run_id/jobs",
            {
                owner,
                repo,
                run_id,
            }
        );
        return jobs;
    } catch (error: any) {
        throw new Error("Error getting all jobs: " + error.message);
    }
}

export async function createCheckRun(
  owner: string,
  repo: string,
  head_sha: string,
  name: string,
  status: any,
  conclusion: any,
  output: any
) {
  try {
    let check = await restClient.checks.create({
      owner,
      repo,
      head_sha,
      name,
      status,
      conclusion,
      output,
    });
    return check;
  } catch (error: any) {
    throw new Error("Error creating check: " + error.message);
  }
}
