"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChecks = getAllChecks;
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
//# sourceMappingURL=checksAPI.js.map