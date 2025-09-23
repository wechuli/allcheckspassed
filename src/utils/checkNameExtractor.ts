import yaml from "yaml";
import { sanitizedInputs } from "./inputsExtractor";
import { restClient } from "./octokit";
import * as core from "@actions/core";
import * as github from "@actions/github";

interface IJob {
  name?: string;
  steps: any[];
}

interface IJobs {
  [key: string]: IJob;
}

interface JobConfig {
  jobs: IJobs;
}

function extractFilePath(
  input: string | undefined = process.env.GITHUB_WORKFLOW_REF
): string {
  if (input === undefined) {
    throw new Error("Error getting file path");
  }
  let splitAt = input.split("@");
  let splitOnSlash = splitAt[0].split("/");
  // take last element
  let lastElement = splitOnSlash[splitOnSlash.length - 1];
  return ".github/workflows/" + lastElement;
}

async function getFile(
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<JobConfig> {
  try {
    let file: any = await restClient.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    // parse the yaml file to json
    let fileContent = Buffer.from(file.data.content, "base64").toString();
    return yaml.parse(fileContent);
  } catch (error: any) {
    throw new Error("Error getting file: " + error.message);
  }
}

async function getCheckNameFromCheckRunId(
  owner: string,
  repo: string,
  checkRunId: number
): Promise<string> {
  try {
    let checkRun: any = await restClient.checks.get({
      owner,
      repo,
      check_run_id: checkRunId,
    });
    return checkRun.data.name;
  } catch (error: any) {
    throw new Error("Error getting check run: " + error.message);
  }
}

export async function extractOwnCheckNameFromWorkflow(): Promise<string> {
  const owner: string = github.context.repo.owner;
  const repo: string = github.context.repo.repo;
  const path: string = extractFilePath();
  const ref: string = sanitizedInputs.commitSHA;
  const jobName = process.env.GITHUB_JOB as string;
  const checkRunId = sanitizedInputs.checkRunId;

  try {
    let checkName: string;
    if (checkRunId) {
      checkName = await getCheckNameFromCheckRunId(owner, repo, checkRunId);
      core.debug(`Extracted check name from check run id: ${checkName}`);
    } else {
      let workflow = await getFile(owner, repo, path, ref);
      checkName = workflow.jobs[jobName].name || jobName;
      core.debug(`Extracted check name from workflow file: ${checkName}`);
    }
    return checkName;
  } catch (error: any) {
    core.warning(
      `Error extracting job name from workflow file, falling back to ${JSON.stringify(
        jobName
      )} (this may not be correct): ${error}`
    );
    // If we have some error getting and parsing the file, we just return the job name
    return jobName;
  }
}
