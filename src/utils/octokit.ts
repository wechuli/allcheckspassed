import * as octokit from "@octokit/rest";
import * as core from "@actions/core";

var restClient = new octokit.Octokit({
  auth: core.getInput("token"),
  userAgent: "allcheckspassed-action",
  baseUrl: process.env.GITHUB_API_URL || "https://api.github.com",
  log: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
});

export { restClient };
