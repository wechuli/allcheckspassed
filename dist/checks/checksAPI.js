"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckRun = exports.getJobsForWorkflowRun = exports.getAllStatusCommits = exports.getAllChecks = void 0;
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
exports.getAllChecks = getAllChecks;
async function getAllStatusCommits(owner, repo, ref) {
    try {
        let statuses = await octokit_1.restClient.paginate("GET /repos/:owner/:repo/commits/:ref/statuses", {
            owner,
            repo,
            ref,
        });
        return statuses;
    }
    catch (error) {
        throw new Error("Error getting all statuses: " + error.message);
    }
}
exports.getAllStatusCommits = getAllStatusCommits;
async function getJobsForWorkflowRun(owner, repo, run_id) {
    try {
        let jobs = await octokit_1.restClient.paginate("GET /repos/:owner/:repo/actions/runs/:run_id/jobs", {
            owner,
            repo,
            run_id,
        });
        return jobs;
    }
    catch (error) {
        throw new Error("Error getting all jobs: " + error.message);
    }
}
exports.getJobsForWorkflowRun = getJobsForWorkflowRun;
async function createCheckRun(owner, repo, head_sha, name, status, conclusion, output) {
    try {
        let check = await octokit_1.restClient.checks.create({
            owner,
            repo,
            head_sha,
            name,
            status,
            conclusion,
            output,
        });
        return check;
    }
    catch (error) {
        throw new Error("Error creating check: " + error.message);
    }
}
exports.createCheckRun = createCheckRun;
//# sourceMappingURL=checksAPI.js.map