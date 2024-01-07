import * as core from "@actions/core";
import * as github from "@actions/github";
import { validateIntervalValues } from "./validators";
import {ICheckInput} from '../checks/checksInterfaces';

/**
 * Parses the inputs for the action.
 * @returns {object} The parsed inputs.
 */

export interface IInputs {
  commitSHA: string;
  checksInclude: ICheckInput [];
  checksExclude: ICheckInput [];
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

  const checksInclude: ICheckInput[] = parseChecksArray(core.getInput("checks_include"),"checks_include");
  const checksExclude: ICheckInput[] = parseChecksArray(core.getInput("checks_exclude"),"checks_exclude") ;
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

function parseChecksArray(input: string, inputType:string = "checks_include"): ICheckInput[]{

    try{

        const trimmedInput = input.trim();

        if (trimmedInput === "-1") {
            return [];
        }

       if (trimmedInput.startsWith("{") && trimmedInput.endsWith("}")) {

            let parsedInput = JSON.parse("[" + trimmedInput + "]");
            if (!validateCheckInputs(parsedInput)) {
                throw new Error();
            }
            return parsedInput;
       }
       if (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
           let parsedInput = JSON.parse(trimmedInput);
              if (!validateCheckInputs(parsedInput)) {
                throw new Error();
              }
           return parsedInput;
       }

        else {
            return trimmedInput.split(',').map(element => {
                return {name: element.trim(),app_id: -1};
            });
        }

    }
    catch(error:any){
        throw new Error(`Error parsing the ${inputType} input, please provide a comma-separated list of check names, or a valid JSON array of objects with the properties "name" and "app_id"`)
    }

}

function isValidCheckInput(object: any): object is ICheckInput {
    return typeof object.name === 'string' && typeof object.app_id === 'number';
}

function validateCheckInputs(array: any[]): array is ICheckInput[] {
    return array.every(isValidCheckInput);
}


export const sanitizedInputs = inputsParser();


