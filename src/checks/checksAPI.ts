import { restClient } from "../utils/octokit";
import { ICheck } from "./checksInterfaces";

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
