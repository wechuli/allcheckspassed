"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const checksAPI_1 = require("./checksAPI");
const statusesAPI_1 = require("../statuses/statusesAPI");
const statuses_1 = require("../statuses/statuses");
const statusesConstants_1 = require("../statuses/statusesConstants");
const checksFilters_1 = require("./checksFilters");
const timeFuncs_1 = require("../utils/timeFuncs");
const checkNameExtractor_1 = require("../utils/checkNameExtractor");
const checksConstants_1 = require("./checksConstants");
const checkEmoji_1 = require("./checkEmoji");
const statusesFilters_1 = require("../statuses/statusesFilters");
class Checks {
    // data
    allChecks = [];
    filteredChecks = [];
    missingChecks = [];
    ownCheck; //the check from the workflow run itself
    // inputs
    owner;
    repo;
    ref;
    checksExclude;
    checksInclude;
    treatSkippedAsPassed;
    treatNeutralAsPassed;
    failOnMissingChecks;
    failFast;
    failStep;
    poll;
    retries;
    pollingInterval;
    verbose;
    showJobSummary;
    includeStatusCommits;
    constructor(props) {
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
            let checks = await (0, checksAPI_1.getAllChecks)(this.owner, this.repo, this.ref);
            // if the user wanted us to include the commit statuses as well, then we will fetch them and add them to the checks
            if (this.includeStatusCommits) {
                let statusCommits = await (0, statusesAPI_1.getAllStatusCommits)(this.owner, this.repo, this.ref);
                let statusChecksAsCommits = (0, statuses_1.mapStatusesToChecksModel)((0, statusesFilters_1.getMostRecentStatusPerContextAndCreator)(statusCommits));
                checks = checks.concat(statusChecksAsCommits);
            }
            this.allChecks = checks;
        }
        catch (error) {
            throw new Error("Error getting all checks: " + error.message);
        }
    }
    async filterChecks() {
        // let's get the check from the workflow run itself, if the value already exists, don't re-fetch it
        if (!this.ownCheck) {
            let ownCheckName = await (0, checkNameExtractor_1.extractOwnCheckNameFromWorkflow)();
            this.ownCheck = this.allChecks.find((check) => check.name === ownCheckName && check.app.slug === checksConstants_1.GitHubActionsBotSlug);
            if (!this.ownCheck) {
                core.warning(`Could not determine own allcheckspassed check (expected name: ${JSON.stringify(ownCheckName)}, this may cause an indefinite loop)`);
            }
        }
        // start by checking if the user has defined both checks_include and checks_exclude inputs and fail if that is the case
        let ambigousChecks = (0, checksFilters_1.checkOneOfTheChecksInputIsEmpty)(this.checksInclude, this.checksExclude);
        if (!ambigousChecks) {
            throw new Error("You cannot define both checks_include and checks_exclude inputs, please use only one of them");
        }
        // if neither checks_include nor checks_exclude are defined, then we will use all checks
        if (this.checksInclude.length === 0 && this.checksExclude.length === 0) {
            this.filteredChecks = (0, checksFilters_1.takeMostRecentChecksForMatchingNameAndAppId)(this.allChecks);
            return;
        }
        // if only checks_include is defined, then we will use only the checks that are included
        if (this.checksInclude.length > 0 && this.checksExclude.length === 0) {
            let firstPassthrough = (0, checksFilters_1.filterChecksWithMatchingNameAndAppId)(this.allChecks, this.checksInclude);
            // lets separate the object
            let filteredChecks = firstPassthrough["filteredChecks"];
            let missingChecks = firstPassthrough["missingChecks"];
            this.filteredChecks = (0, checksFilters_1.takeMostRecentChecksForMatchingNameAndAppId)((0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(filteredChecks));
            this.missingChecks =
                (0, checksFilters_1.removeDuplicateEntriesChecksInputsFromSelf)(missingChecks);
            return;
        }
        if (this.checksExclude.length > 0 && this.checksInclude.length === 0) {
            let firstPassthrough = (0, checksFilters_1.removeChecksWithMatchingNameAndAppId)(this.allChecks, this.checksExclude);
            this.filteredChecks = (0, checksFilters_1.takeMostRecentChecksForMatchingNameAndAppId)((0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(firstPassthrough));
            return;
        }
    }
    evaluateChecksStatus(checks) {
        // conclusions that determine a fail
        let failureConclusions = [
            checksConstants_1.checkConclusion.FAILURE,
            checksConstants_1.checkConclusion.TIMED_OUT,
            checksConstants_1.checkConclusion.CANCELLED,
            checksConstants_1.checkConclusion.ACTION_REQUIRED,
            checksConstants_1.checkConclusion.STALE,
        ];
        // if the user wanted us to treat skipped as a failure, then we will add it to the failureConclusions array
        if (!this.treatSkippedAsPassed) {
            failureConclusions.push(checksConstants_1.checkConclusion.SKIPPED);
        }
        // if the user wanted us to treat neutral as a failure, then we will add it to the failureConclusions array
        if (!this.treatNeutralAsPassed) {
            failureConclusions.push(checksConstants_1.checkConclusion.NEUTRAL);
        }
        let failingChecks = checks.filter((check) => failureConclusions.includes(check.conclusion));
        // if any of the checks are failing and we wish to fail fast, then we will return true now - default behavior
        if (failingChecks.length > 0 && this.failFast) {
            return { in_progress: false, passed: false };
        }
        // if any of the checks are still in_progress or queued or waiting, then we will return false
        let inProgressQueuedWaiting = [
            checksConstants_1.checkStatus.IN_PROGRESS,
            checksConstants_1.checkStatus.QUEUED,
            checksConstants_1.checkStatus.WAITING,
            checksConstants_1.checkStatus.PENDING,
        ];
        let anyInProgressQueuedWaiting = checks.filter((check) => inProgressQueuedWaiting.includes(check.status));
        if (anyInProgressQueuedWaiting.length > 0) {
            if (this.verbose) {
                anyInProgressQueuedWaiting.forEach((check) => {
                    core.info(`Waiting for check completion of ${JSON.stringify(check.name)}`);
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
        let filteredChecksExcludingOwnCheck = this.filteredChecks.filter((check) => check.id !== this.ownCheck?.id);
        let checksResult = this.evaluateChecksStatus(filteredChecksExcludingOwnCheck);
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
        let missingChecks = [];
        let filteredChecksExcludingOwnCheck = [];
        const evaluationCompleteMessage = "Checks evaluation complete, reporting results";
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
            core.info(`Polling API for checks status, iteration: ${iteration} out of ${this.retries}`);
            if (!inProgressChecks) {
                core.info(evaluationCompleteMessage);
                break;
            }
            await (0, timeFuncs_1.sleep)(this.pollingInterval * 1000 * 60);
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
        let checksOnly = filteredChecksExcludingOwnCheck.filter((check) => check.commit_status === undefined);
        let commitStatusesOnly = filteredChecksExcludingOwnCheck.filter((check) => check.commit_status !== undefined);
        let checkSummary = checksOnly.map((check) => {
            return [
                check.name,
                check.status,
                check.conclusion ? (0, checkEmoji_1.addCheckConclusionEmoji)(check.conclusion) : " ",
                check.started_at,
                check.completed_at ? check.completed_at : " ",
                check.app.name,
                check.app.id.toString(),
            ];
        });
        let commitStatusesSummary = commitStatusesOnly.map((check) => {
            return [
                check.commit_status?.context,
                (0, statusesConstants_1.addCommitStatusEmoji)(check.commit_status?.state),
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
            core.setFailed("Some checks have failed or timed out, please check the workflow run summary to get the details");
        }
        if (missingChecks.length > 0) {
            core.warning("Some checks were not found, please check the workflow run summary to get the details");
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
exports.default = Checks;
//# sourceMappingURL=checks.js.map