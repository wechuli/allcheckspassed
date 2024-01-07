import * as core from "@actions/core";
import * as github from "@actions/github";
import { getAllChecks } from "./checks/checksAPI";
import {sanitizedInputs} from "./utils/inputsExtractor";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug("Hello from the action!");
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;

    console.log(sanitizedInputs.checksInclude)
    console.log(sanitizedInputs.checksExclude)

    // const allChecks = await getAllChecks(owner, repo, sha);
    // console.log("All checks: " + JSON.stringify(allChecks));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {core.setFailed(error.message)};
  }
}
