import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * Parses the inputs for the action.
 * @returns {object} The parsed inputs.
 */

interface Iinputs {
  commitSHA: string;
  checks: string[];
  checksExclude: string[];
  treatSkippedAsPassed: boolean;
  createCheck: boolean;
  includeCommitStatuses: boolean;
}
export default function inputsParser(): Iinputs {
  const eventName = github.context.eventName;
  const validPullRequestEvents = ["pull_request", "pull_request_target"];
  let headSha: string | undefined = undefined;
  if (validPullRequestEvents.includes(eventName)) {
    headSha = github.context.payload.pull_request?.head.sha as string;
  }
  const commitSHA: string =
    core.getInput("commit_sha") || headSha || github.context.sha;

  const checks: string[] =
    core.getInput("checks") == "-1" ? [] : core.getInput("checks").split(",");
  const checksExclude: string[] =
    core.getInput("checks_exclude") == "-1"
      ? []
      : core.getInput("checks_exclude").split(",");
  const treatSkippedAsPassed: boolean =
    core.getInput("treat_skipped_as_passed") == "true";
  const createCheck: boolean = core.getInput("create_check") == "true";
  const includeCommitStatuses: boolean =
    core.getInput("include_commit_statuses") == "true";

  return {
    commitSHA,
    checks,
    checksExclude,
    treatSkippedAsPassed,
    createCheck,
    includeCommitStatuses,
  };
}
