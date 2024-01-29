import * as octokit from "@octokit/rest";
import * as core from "@actions/core";

export const restClient = new octokit.Octokit({
    auth: core.getInput("token"),
    userAgent: "allcheckspassed-action",
    baseUrl: process.env.GITHUB_API_URL || "https://api.github.com",
    log: {
        // don't log info and debug messages
        info: () => {
        },
        debug: () => {
        },
        warn: console.warn,
        error: console.error,
    },
});


