import * as core from "@actions/core";
import * as github from "@actions/github";
import Checks from "./checks/checks";
import {sanitizedInputs} from "./utils/inputsExtractor";
import {extractOwnCheckNameFromWorkflow} from "./utils/fileExtractor";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        core.debug("Hello from the action!");
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;

        const inputs = sanitizedInputs;

        const checks = new Checks({...inputs, owner, repo});
        await checks.runLogic();

        console.log(await extractOwnCheckNameFromWorkflow());

        console.log(`checks: ${JSON.stringify(checks.allChecks)}`);

        console.log(`filtered checks: ${JSON.stringify(checks.filteredChecks)}`);
        console.log(`own check: ${JSON.stringify(checks.ownCheck)}`);

    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) {
            core.setFailed(error.message)
        }
        ;
    }
}
