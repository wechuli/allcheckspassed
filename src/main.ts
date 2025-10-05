import * as core from "@actions/core";
import * as github from "@actions/github";
import Checks from "./checks/checks";
import { sanitizedInputs } from "./utils/inputsExtractor";
import { sleep } from "./utils/timeFuncs";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // delay execution
    core.info(`Validating checks, standby...`);
    await sleep(sanitizedInputs.delay * 1000 * 60);
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const inputs = sanitizedInputs;
    const checks = new Checks({ ...inputs, owner, repo });
    await checks.run();
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
