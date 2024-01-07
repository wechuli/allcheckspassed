import * as core from "@actions/core";
import * as github from "@actions/github";
import { validateIntervalValues } from "./validators";

/**
 * Parses the inputs for the action.
 * @returns {object} The parsed inputs.
 */

export interface IInputs {
  commitSHA: string;
  checksInclude: IminimalCheck [];
  checksExclude: IminimalCheck [];
  treatSkippedAsPassed: boolean;
  createCheck: boolean;
  includeCommitStatuses: boolean;
  poll: boolean;
  delay: number;
  pollingInterval: number;
  failStep: boolean;
  failFast: boolean;
}
interface IminimalCheck{
    name: string;
    app_id: number;
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

  const checksInclude: IminimalCheck[] = parseChecksArray(core.getInput("checks_include"));
  const checksExclude: IminimalCheck[] =
    parseChecksArray(core.getInput("checks_exclude")) ;
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

function parseChecksArray(input: string): IminimalCheck[] {

    try{

        // Return an empty array if the input is "-1"
        if (input === "-1") {
            return [];
        }

        // Trim the input to remove any leading/trailing whitespace
        const trimmedInput = input.trim();

        // Check if the input starts with '[{', indicating a JSON array of objects
        if (trimmedInput.startsWith('[{') && trimmedInput.endsWith('}]')) {
            return JSON.parse(trimmedInput);
        }

        // Check if the input starts with a '{', indicating a JSON-like object
        else if (trimmedInput.startsWith('{')) {
            // Split the string by '},{', then add the missing braces back to each element
            return trimmedInput.split('},{').map(element => {
                if (!element.startsWith('{')) element = '{' + element;
                if (!element.endsWith('}')) element = element + '}';
                return JSON.parse(element);
            });
        }

        // Otherwise, assume it's a comma-separated list
        else {
            return trimmedInput.split(',').map(element => {
                return {name: element.trim(),app_id: -1};
            });
        }

    }
    catch(error:any){
        throw new Error("Error parsing checks array: " + error.message);
    }

}

export const sanitizedInputs = inputsParser();


