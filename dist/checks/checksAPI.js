"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChecks = getAllChecks;
exports.getWorkflowRunsForCommit = getWorkflowRunsForCommit;
const octokit_1 = require("../utils/octokit");
async function getAllChecks(owner, repo, ref) {
    try {
        let checks = await octokit_1.restClient.paginate("GET /repos/:owner/:repo/commits/:ref/check-runs", {
            owner,
            repo,
            ref,
        });
        return checks;
    }
    catch (error) {
        throw new Error("Error getting all checks: " + error.message);
    }
}
async function getWorkflowRunsForCommit(owner, repo, headSha) {
    try {
        let runs = await octokit_1.restClient.paginate("GET /repos/:owner/:repo/actions/runs", {
            owner,
            repo,
            head_sha: headSha,
        });
        return runs.map((run) => ({
            id: run.id,
            workflow_id: run.workflow_id,
            check_suite_id: run.check_suite_id,
        }));
    }
    catch (error) {
        throw new Error("Error getting workflow runs for commit: " + error.message);
    }
}
//# sourceMappingURL=checksAPI.js.map