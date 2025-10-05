import { restClient } from "../utils/octokit";
import { IStatus } from "./statusesInterfaces";

export async function getAllStatusCommits(
  owner: string,
  repo: string,
  ref: string
): Promise<IStatus[]> {
  try {
    let statuses = await restClient.paginate(
      "GET /repos/:owner/:repo/commits/:ref/statuses",
      {
        owner,
        repo,
        ref,
      }
    );
    return statuses as IStatus[];
  } catch (error: any) {
    throw new Error("Error getting all statuses: " + error.message);
  }
}
