import * as core from "@actions/core";
import * as github from "@actions/github";
import { validateIntervalValues } from "./validators";
import { ICheckInput } from "../checks/checksInterfaces";
import { removeDuplicateEntriesChecksInputsFromSelf } from "../checks/checksFilters";

/**
 * Parses the inputs for the action.
 * @returns {object} The parsed inputs.
 */

export interface IInputs {
  commitSHA: string;
  checksInclude: ICheckInput[];
  checksExclude: ICheckInput[];
  treatSkippedAsPassed: boolean;
  treatNeutralAsPassed: boolean;
  poll: boolean;
  delay: number;
  pollingInterval: number;
  retries: number;
  failFast: boolean;
  failStep: boolean;
  failOnMissingChecks: boolean;
  verbose: boolean;
  showJobSummary: boolean;
  checkRunId?: number | undefined;
  includeStatusCommits: boolean;
}

function inputsParser(): IInputs {
  const eventName = github.context.eventName;
  const validPullRequestEvents = ["pull_request", "pull_request_target", "pull_request_review"];
  let headSha: string | undefined = undefined;
  if (validPullRequestEvents.includes(eventName)) {
    headSha = github.context.payload.pull_request?.head.sha as string;
  }
  const commitSHA: string =
    core.getInput("commit_sha") || headSha || github.context.sha;

  const checksInclude: ICheckInput[] =
    removeDuplicateEntriesChecksInputsFromSelf(
      parseChecksArray(core.getInput("checks_include"), "checks_include")
    );
  const checksExclude: ICheckInput[] =
    removeDuplicateEntriesChecksInputsFromSelf(
      parseChecksArray(core.getInput("checks_exclude"), "checks_exclude")
    );
  const treatSkippedAsPassed: boolean =
    core.getInput("treat_skipped_as_passed") == "true";
  const treatNeutralAsPassed: boolean =
    core.getInput("treat_neutral_as_passed") == "true";
  const failFast: boolean = core.getInput("fail_fast") == "true";
  const failStep: boolean = core.getInput("fail_step") == "true";
  const failOnMissingChecks: boolean =
    core.getInput("fail_on_missing_checks") == "true";
  const poll: boolean = core.getInput("poll") == "true";
  const delay: number = validateIntervalValues(
    parseFloat(core.getInput("delay"))
  );
  const pollingInterval: number = validateIntervalValues(
    parseFloat(core.getInput("polling_interval"))
  );
  const retries: number = validateIntervalValues(
    parseInt(core.getInput("retries"))
  );
  const verbose: boolean = core.getInput("verbose") == "true";
  const showJobSummary: boolean = core.getInput("show_job_summary") == "true";
  const checkRunId: number | undefined =
    parseInt(core.getInput("check_run_id")) || undefined;
  const includeStatusCommits: boolean =
    core.getInput("include_status_commits") == "true";

  return {
    commitSHA,
    checksInclude,
    checksExclude,
    treatSkippedAsPassed,
    treatNeutralAsPassed,
    poll,
    delay,
    pollingInterval,
    retries,
    failFast,
    failStep,
    failOnMissingChecks,
    verbose,
    showJobSummary,
    checkRunId,
    includeStatusCommits,
  };
}

export function parseChecksArray(
  input: string,
  inputType: string = "checks_include"
): ICheckInput[] {
  try {
    const trimmedInput = input.trim();

    let checks: ICheckInput[] = [];

    if (trimmedInput === "-1") {
      return [];
    }

    // attempt to parse as JSON if it starts with { or [

    if (trimmedInput.startsWith("{")) {
      checks = JSON.parse("[" + trimmedInput + "]");
    } else if (trimmedInput.startsWith("[")) {
      checks = JSON.parse(trimmedInput);
    } else {
      // Split by commas.
      checks = trimmedInput.split(",").map((element) => {
        return { name: element.trim(), app_id: -1 };
      });
    }

    // Remove checks with no filtering ability
    checks = checks.filter((c) => c.app_id !== -1 || c.name !== "");

    if (!validateCheckInputs(checks)) {
      throw new Error();
    }

    return checks;
  } catch (error: any) {
    throw new Error(
      `Error parsing the ${inputType} input, please provide a comma-separated list of check names, or a valid JSON array of objects with the properties "name" and "app_id"`
    );
  }
}

export function isValidCheckInput(object: any): object is ICheckInput {
  return typeof object.name === "string" && typeof object.app_id === "number";
}

export function validateCheckInputs(array: any[]): array is ICheckInput[] {
  return array.every(isValidCheckInput);
}

export const sanitizedInputs = inputsParser();
