import * as core from "@actions/core";
import { IInputs } from "../utils/inputsExtractor";
import { getAllChecks } from "./checksAPI";
import { getAllStatusCommits } from "../statuses/statusesAPI";
import { mapStatusesToChecksModel } from "../statuses/statuses";
import { addCommitStatusEmoji } from "../statuses/statusesConstants";
import {
  ICheckInput,
  ICheck,
  IDetermineChecksStatus,
} from "./checksInterfaces";
import {
  checkOneOfTheChecksInputIsEmpty,
  filterChecksWithMatchingNameAndAppId,
  removeChecksWithMatchingNameAndAppId,
  removeDuplicateChecksEntriesFromSelf,
  removeDuplicateEntriesChecksInputsFromSelf,
  takeMostRecentChecksForMatchingNameAndAppId,
} from "./checksFilters";
import { sleep } from "../utils/timeFuncs";
import { extractOwnCheckNameFromWorkflow } from "../utils/checkNameExtractor";
import {
  checkConclusion,
  GitHubActionsBotSlug,
  checkStatus,
} from "./checksConstants";
import { addCheckConclusionEmoji } from "./checkEmoji";
import { getMostRecentStatusPerContextAndCreator } from "../statuses/statusesFilters";

interface IRepo {
  owner: string;
  repo: string;
}

export default class Checks {
  // data
  private allChecks: ICheck[] = [];
  private filteredChecks: ICheck[] = [];
  private missingChecks: ICheckInput[] = [];
  private ownCheck: ICheck | undefined; //the check from the workflow run itself

  // inputs
  private owner: string;
  private repo: string;
  private ref: string;
  private checksExclude: ICheckInput[];
  private checksInclude: ICheckInput[];
  private treatSkippedAsPassed: boolean;
  private treatNeutralAsPassed: boolean;
  private failOnMissingChecks: boolean;
  private failFast: boolean;
  private failStep: boolean;
  private poll: boolean;
  private retries: number;
  private pollingInterval: number;
  private verbose: boolean;
  private showJobSummary: boolean;
  private includeStatusCommits: boolean;

  constructor(props: IRepo & IInputs) {
    this.owner = props.owner;
    this.repo = props.repo;
    this.ref = props.commitSHA;
    this.checksExclude = props.checksExclude;
    this.checksInclude = props.checksInclude;
    this.treatSkippedAsPassed = props.treatSkippedAsPassed;
    this.treatNeutralAsPassed = props.treatNeutralAsPassed;
    this.failFast = props.failFast;
    this.failStep = props.failStep;
    this.failOnMissingChecks = props.failOnMissingChecks;
    this.poll = props.poll;
    this.pollingInterval = props.pollingInterval;
    this.retries = props.retries;
    this.verbose = props.verbose;
    this.showJobSummary = props.showJobSummary;
    this.includeStatusCommits = props.includeStatusCommits;
  }

  async fetchAllChecks() {
    try {
      let checks = await getAllChecks(this.owner, this.repo, this.ref);

      // if the user wanted us to include the commit statuses as well, then we will fetch them and add them to the checks
      if (this.includeStatusCommits) {
        let statusCommits = await getAllStatusCommits(
          this.owner,
          this.repo,
          this.ref
        );
        let statusChecksAsCommits = mapStatusesToChecksModel(
          getMostRecentStatusPerContextAndCreator(statusCommits)
        );
        checks = checks.concat(statusChecksAsCommits);
      }
      this.allChecks = checks;
    } catch (error: any) {
      throw new Error("Error getting all checks: " + error.message);
    }
  }

  async filterChecks() {
    // let's get the check from the workflow run itself, if the value already exists, don't re-fetch it

    if (!this.ownCheck) {
      let ownCheckName = await extractOwnCheckNameFromWorkflow();

      this.ownCheck = this.allChecks.find(
        (check) =>
          check.name === ownCheckName && check.app.slug === GitHubActionsBotSlug
      );

      if (!this.ownCheck) {
        core.warning(
          `Could not determine own allcheckspassed check (expected name: ${JSON.stringify(
            ownCheckName
          )}, this may cause an indefinite loop)`
        );
      }
    }

    // start by checking if the user has defined both checks_include and checks_exclude inputs and fail if that is the case
    let ambigousChecks = checkOneOfTheChecksInputIsEmpty(
      this.checksInclude,
      this.checksExclude
    );
    if (!ambigousChecks) {
      throw new Error(
        "You cannot define both checks_include and checks_exclude inputs, please use only one of them"
      );
    }
    // if neither checks_include nor checks_exclude are defined, then we will use all checks

    if (this.checksInclude.length === 0 && this.checksExclude.length === 0) {
      this.filteredChecks = takeMostRecentChecksForMatchingNameAndAppId(
        this.allChecks
      );
      return;
    }

    // if only checks_include is defined, then we will use only the checks that are included
    if (this.checksInclude.length > 0 && this.checksExclude.length === 0) {
      let firstPassthrough = filterChecksWithMatchingNameAndAppId(
        this.allChecks,
        this.checksInclude
      );
      // lets separate the object

      let filteredChecks = firstPassthrough["filteredChecks"];
      let missingChecks = firstPassthrough["missingChecks"];

      this.filteredChecks = takeMostRecentChecksForMatchingNameAndAppId(
        removeDuplicateChecksEntriesFromSelf(filteredChecks)
      );
      this.missingChecks =
        removeDuplicateEntriesChecksInputsFromSelf(missingChecks);
      return;
    }

    if (this.checksExclude.length > 0 && this.checksInclude.length === 0) {
      let firstPassthrough = removeChecksWithMatchingNameAndAppId(
        this.allChecks,
        this.checksExclude
      );
      this.filteredChecks = takeMostRecentChecksForMatchingNameAndAppId(
        removeDuplicateChecksEntriesFromSelf(firstPassthrough)
      );
      return;
    }
  }

  evaluateChecksStatus(checks: ICheck[]): IDetermineChecksStatus {
    // conclusions that determine a fail
    let failureConclusions: string[] = [
      checkConclusion.FAILURE,
      checkConclusion.TIMED_OUT,
      checkConclusion.CANCELLED,
      checkConclusion.ACTION_REQUIRED,
      checkConclusion.STALE,
    ];
    // if the user wanted us to treat skipped as a failure, then we will add it to the failureConclusions array
    if (!this.treatSkippedAsPassed) {
      failureConclusions.push(checkConclusion.SKIPPED);
    }

    // if the user wanted us to treat neutral as a failure, then we will add it to the failureConclusions array
    if (!this.treatNeutralAsPassed) {
      failureConclusions.push(checkConclusion.NEUTRAL);
    }

    let failingChecks = checks.filter((check) =>
      failureConclusions.includes(check.conclusion!)
    );
    // if any of the checks are failing and we wish to fail fast, then we will return true now - default behavior
    if (failingChecks.length > 0 && this.failFast) {
      return { in_progress: false, passed: false };
    }

    // if any of the checks are still in_progress or queued or waiting, then we will return false
    let inProgressQueuedWaiting = [
      checkStatus.IN_PROGRESS,
      checkStatus.QUEUED,
      checkStatus.WAITING,
    ];
    let anyInProgressQueuedWaiting = checks.filter((check) =>
      inProgressQueuedWaiting.includes(check.status)
    );
    if (anyInProgressQueuedWaiting.length > 0) {
      if (this.verbose) {
        anyInProgressQueuedWaiting.forEach((check) => {
          core.info(
            `Waiting for check completion of ${JSON.stringify(check.name)}`
          );
        });
      }

      return { in_progress: true, passed: false };
    }

    // if any of the checks are failing and we did not fail fast, then we will return true now
    if (failingChecks.length > 0) {
      return { in_progress: false, passed: false };
    }

    // if none of the above trigger, everything has finished and passed
    return { in_progress: false, passed: true };
  }

  async iterateChecks() {
    await this.fetchAllChecks();
    await this.filterChecks();

    // check for any in_progess checks in the filtered checks excluding the check from the workflow run itself

    let filteredChecksExcludingOwnCheck = this.filteredChecks.filter(
      (check) => check.id !== this.ownCheck?.id
    );
    let checksResult = this.evaluateChecksStatus(
      filteredChecksExcludingOwnCheck
    );

    return {
      checksResult,
      missingChecks: this.missingChecks,
      filteredChecksExcludingOwnCheck,
    };
  }

  async run() {
    let iteration = 0;
    let inProgressChecks = true;
    let allChecksPass = false;
    let missingChecks: ICheckInput[] = [];
    let filteredChecksExcludingOwnCheck: ICheck[] = [];
    const evaluationCompleteMessage =
      "Checks evaluation complete, reporting results";

    do {
      iteration++;
      let result = await this.iterateChecks();
      inProgressChecks = result["checksResult"]["in_progress"];
      allChecksPass = result["checksResult"]["passed"];
      missingChecks = result["missingChecks"];
      filteredChecksExcludingOwnCheck =
        result["filteredChecksExcludingOwnCheck"];

      //check if the user wants us to poll
      if (!this.poll) {
        core.info(evaluationCompleteMessage);
        break;
      }
      core.info(
        `Polling API for checks status, iteration: ${iteration} out of ${this.retries}`
      );
      if (!inProgressChecks) {
        core.info(evaluationCompleteMessage);
        break;
      }
      await sleep(this.pollingInterval * 1000 * 60);
    } while (iteration < this.retries);

    // create table with results of filtered checks

    let checkSummaryHeader = [
      { data: "name", header: true },
      { data: "status", header: true },
      {
        data: "conclusion",
        header: true,
      },
      { data: "started_at", header: true },
      { data: "completed_at", header: true },
      {
        data: "app.name",
        header: true,
      },
      { data: "app.id", header: true },
    ];

    let commitStatusesSummaryHeader = [
      { data: "context", header: true },
      { data: "state", header: true },
      { data: "created_at", header: true },
      { data: "updated_at", header: true },
      { data: "creator.login", header: true },
      { data: "creator.id", header: true },
    ];

    // pull out checks and commits statuses separately in the summary, for checks the commit_status is undefined, for commit statuses the commit_status is defined

    let checksOnly = filteredChecksExcludingOwnCheck.filter(
      (check) => check.commit_status === undefined
    );
    let commitStatusesOnly = filteredChecksExcludingOwnCheck.filter(
      (check) => check.commit_status !== undefined
    );

    let checkSummary: any[] = checksOnly.map((check) => {
      return [
        check.name,
        check.status,
        check.conclusion ? addCheckConclusionEmoji(check.conclusion) : " ",
        check.started_at,
        check.completed_at ? check.completed_at : " ",
        check.app.name,
        check.app.id.toString(),
      ];
    });

    let commitStatusesSummary: any[] = commitStatusesOnly.map((check) => {
      return [
        check.commit_status?.context,
        addCommitStatusEmoji(check.commit_status?.state as string),
        check.commit_status?.created_at,
        check.commit_status?.updated_at,
        check.commit_status?.creator.login,
        check.commit_status?.creator.id.toString(),
      ];
    });

    if (this.showJobSummary) {
      await core.summary
        .addHeading("Checks Summary")
        .addTable([checkSummaryHeader, ...checkSummary])
        .write();

      if (this.includeStatusCommits && commitStatusesSummary.length > 0) {
        await core.summary
          .addHeading("Commit Statuses Summary")
          .addTable([commitStatusesSummaryHeader, ...commitStatusesSummary])
          .write();
      }
    }

    // create an output with details of the checks evaluated

    // core.setOutput("checks", JSON.stringify(filteredChecksExcludingOwnCheck)); // revisit why this is not working

    // missing checks
    // core.setOutput("missing_checks", JSON.stringify(missingChecks)); // revisit why this is not working

    // fail the step if the checks did not pass and the user wants us to fail
    if (!allChecksPass && this.failStep) {
      core.setFailed(
        "Some checks have failed or timed out, please check the workflow run summary to get the details"
      );
    }

    if (missingChecks.length > 0) {
      core.warning(
        "Some checks were not found, please check the workflow run summary to get the details"
      );
      let missingChecksSummaryHeader = [
        { data: "name", header: true },
        { data: "app.id", header: true },
      ];
      let missingChecksSummary = missingChecks.map((check) => {
        return [check.name, check.app_id.toString()];
      });

      if (this.showJobSummary) {
        await core.summary
          .addHeading("Missing Checks")
          .addTable([missingChecksSummaryHeader, ...missingChecksSummary])
          .write();
      }

      // fail if the user wants us to fail on missing checks and the failStep is true
      if (this.failOnMissingChecks && this.failStep) {
        core.setFailed("Failing due to missing checks");
      }
    }
  }
}
