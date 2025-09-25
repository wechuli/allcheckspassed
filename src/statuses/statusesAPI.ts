import { restClient } from "../utils/octokit";

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
