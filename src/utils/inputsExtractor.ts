import * as core from "@actions/core";
import * as github from "@actions/github";
import { validateIntervalValues } from "./validators";

/**
 * Parses the inputs for the action.
 * @returns {object} The parsed inputs.
 */

export interface IInputs {
  commitSHA: string;
  checksInclude: string[];
  checksExclude: string[];
  treatSkippedAsPassed: boolean;
  createCheck: boolean;
  includeCommitStatuses: boolean;
  poll: boolean;
  delay: number;
  pollingInterval: number;
  failStep: boolean;
  failFast: boolean;
}
 function inputsParser(): IInputs {
  const eventName = github.context.eventName;
  const validPullRequestEvents = ["pull_request", "pull_request_target"];
  let headSha: string | undefined = undefined;
  if (validPullRequestEvents.includes(eventName)) {
    headSha = github.context.payload.pull_request?.head.sha as string;
  }
  const commitSHA: string =
    core.getInput("commit_sha") || headSha || github.context.sha;

  const checksInclude: string[] =
    core.getInput("checks_include") == "-1" ? [] : core.getInput("checks_include").split(",");
  const checksExclude: string[] =
    core.getInput("checks_exclude") == "-1" ? [] : core.getInput("checks_exclude").split(",");
  const treatSkippedAsPassed: boolean =
    core.getInput("treat_skipped_as_passed") == "true";
  const createCheck: boolean = core.getInput("create_check") == "true";
  const includeCommitStatuses: boolean =
    core.getInput("include_commit_statuses") == "true";
  const poll: boolean = core.getInput("poll") == "true";
  const delay: number = validateIntervalValues(
    parseInt(core.getInput("delay"))
  );
  const pollingInterval: number = validateIntervalValues(
    parseInt(core.getInput("polling_interval"))
  );

  const failStep: boolean = core.getInput("fail_step") == "true";
  const failFast: boolean = core.getInput("fail_fast") == "true";

  return {
    commitSHA,
    checksInclude,
    checksExclude,
    treatSkippedAsPassed,
    createCheck,
    includeCommitStatuses,
    poll,
    delay,
    pollingInterval,
    failStep,
    failFast,
  };
}

export const sanitizedInputs = inputsParser();


