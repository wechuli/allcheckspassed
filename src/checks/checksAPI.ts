import { restClient } from "../utils/octokit";

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
