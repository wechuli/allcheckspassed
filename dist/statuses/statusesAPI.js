"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStatusCommits = getAllStatusCommits;
const octokit_1 = require("../utils/octokit");
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
//# sourceMappingURL=statusesAPI.js.map