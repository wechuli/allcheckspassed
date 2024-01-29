"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChecks = void 0;
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
//
// export async function getJobsForWorkflowRun(
//     owner: string,
//     repo: string,
//     run_id: number
// ) {
//     try {
//         let jobs = await restClient.paginate(
//             "GET /repos/:owner/:repo/actions/runs/:run_id/jobs",
//             {
//                 owner,
//                 repo,
//                 run_id,
//             }
//         );
//         return jobs;
//     } catch (error: any) {
//         throw new Error("Error getting all jobs: " + error.message);
//     }
// }
//
// export async function createCheckRun(
//     owner: string,
//     repo: string,
//     head_sha: string,
//     name: string,
//     status: any,
//     conclusion: any,
//     output: any
// ) {
//     try {
//         let check = await restClient.checks.create({
//             owner,
//             repo,
//             head_sha,
//             name,
//             status,
//             conclusion,
//             output,
//         });
//         return check;
//     } catch (error: any) {
//         throw new Error("Error creating check: " + error.message);
//     }
// }
//
//
// export async function getAllStatusCommits(
//     owner: string,
//     repo: string,
//     ref: string
// ) {
//     try {
//         let statuses = await restClient.paginate(
//             "GET /repos/:owner/:repo/commits/:ref/statuses",
//             {
//                 owner,
//                 repo,
//                 ref,
//             }
//         );
//         return statuses;
//     } catch (error: any) {
//         throw new Error("Error getting all statuses: " + error.message);
//     }
// }
//# sourceMappingURL=checksAPI.js.map