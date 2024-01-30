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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const checksAPI_1 = require("./checksAPI");
const checksFilters_1 = require("./checksFilters");
const timeFuncs_1 = require("../utils/timeFuncs");
const fileExtractor_1 = require("../utils/fileExtractor");
const checksConstants_1 = require("./checksConstants");
class Checks {
    // data
    allChecks = [];
    filteredChecks = [];
    allChecksPassed = false;
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
    poll;
    retries;
    pollingInterval;
    constructor(props) {
        this.owner = props.owner;
        this.repo = props.repo;
        this.ref = props.commitSHA;
        this.checksExclude = props.checksExclude;
        this.checksInclude = props.checksInclude;
        this.treatSkippedAsPassed = props.treatSkippedAsPassed;
        this.treatNeutralAsPassed = props.treatNeutralAsPassed;
        this.poll = props.poll;
        this.pollingInterval = props.pollingInterval;
        this.retries = props.retries;
    }
    async fetchAllChecks() {
        try {
            this.allChecks = await (0, checksAPI_1.getAllChecks)(this.owner, this.repo, this.ref);
        }
        catch (error) {
            throw new Error("Error getting all checks: " + error.message);
        }
    }
    async filterChecks() {
        // lets get the check from the workflow run itself, if the value already exists, don't re-fetch it
        if (!this.ownCheck) {
            let ownCheckName = await (0, fileExtractor_1.extractOwnCheckNameFromWorkflow)();
            let gitHubActionsBotId = checksConstants_1.GitHubActionsBotId;
            this.ownCheck = this.allChecks.find(check => check.name === ownCheckName && check.app.id === gitHubActionsBotId);
        }
        // start by checking if the user has defined both checks_include and checks_exclude inputs and fail if that is the case
        let ambigousChecks = (0, checksFilters_1.checkOneOfTheChecksInputIsEmpty)(this.checksInclude, this.checksExclude);
        if (!ambigousChecks) {
            throw new Error("You cannot define both checks_include and checks_exclude inputs, please use only one of them");
        }
        // if neither checks_include nor checks_exclude are defined, then we will use all checks
        if (this.checksInclude.length === 0 && this.checksExclude.length === 0) {
            this.filteredChecks = [...this.allChecks];
            return;
        }
        // if only checks_include is defined, then we will use only the checks that are included
        if (this.checksInclude.length > 0 && this.checksExclude.length === 0) {
            let firstPassthrough = (0, checksFilters_1.filterChecksWithMatchingNameAndAppId)(this.allChecks, this.checksInclude);
            // lets separate the object
            let filteredChecks = firstPassthrough["filteredChecks"];
            let missingChecks = firstPassthrough["missingChecks"];
            this.filteredChecks = (0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(filteredChecks);
            this.missingChecks = (0, checksFilters_1.removeDuplicateEntriesChecksInputsFromSelf)(missingChecks);
            return;
        }
        if (this.checksExclude.length > 0 && this.checksInclude.length === 0) {
            let firstPassthrough = (0, checksFilters_1.removeChecksWithMatchingNameAndAppId)(this.allChecks, this.checksExclude);
            this.filteredChecks = (0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(firstPassthrough);
            return;
        }
    }
    ;
    determineChecksFailure(checks) {
        // if any of the checks are still in_progress or queued or waiting, then we will return false
        let inProgressQueuedWaiting = [checksConstants_1.checkStatus.IN_PROGRESS, checksConstants_1.checkStatus.QUEUED, checksConstants_1.checkStatus.WAITING];
        let anyInProgressQueuedWaiting = checks.filter(check => inProgressQueuedWaiting.includes(check.status));
        if (anyInProgressQueuedWaiting.length > 0) {
            return false;
        }
        // conclusions that determine a fail
        let failureConclusions = [checksConstants_1.checkConclusion.FAILURE, checksConstants_1.checkConclusion.TIMED_OUT, checksConstants_1.checkConclusion.CANCELLED, checksConstants_1.checkConclusion.ACTION_REQUIRED, checksConstants_1.checkConclusion.STALE];
        // if the user wanted us to treat skipped as a failure, then we will add it to the failureConclusions array
        if (!this.treatSkippedAsPassed) {
            failureConclusions.push(checksConstants_1.checkConclusion.SKIPPED);
        }
        // if the user wanted us to treat neutral as a failure, then we will add it to the failureConclusions array
        if (!this.treatNeutralAsPassed) {
            failureConclusions.push(checksConstants_1.checkConclusion.NEUTRAL);
        }
        // if any of the checks are failing, then we will return true
        let failingChecks = checks.filter(check => failureConclusions.includes(check.conclusion));
        if (failingChecks.length > 0) {
            return false;
        }
        return true;
    }
    ;
    async iterate() {
        await this.fetchAllChecks();
        await this.filterChecks();
        // check for any in_progess checks in the filtered checks excluding the check from the workflow run itself
        let filteredChecksExcludingOwnCheck = this.filteredChecks.filter(check => check.id !== this.ownCheck?.id);
        let allChecksPass = this.determineChecksFailure(filteredChecksExcludingOwnCheck);
        this.allChecksPassed = allChecksPass;
        return {
            allChecksPass, missingChecks: this.missingChecks, filteredChecksExcludingOwnCheck
        };
    }
    async run() {
        let iteration = 0;
        let allChecksPass = false;
        let missingChecks = [];
        let filteredChecksExcludingOwnCheck = [];
        while (iteration < this.retries) {
            iteration++;
            let result = await this.iterate();
            allChecksPass = result["allChecksPass"];
            missingChecks = result["missingChecks"];
            filteredChecksExcludingOwnCheck = result["filteredChecksExcludingOwnCheck"];
            //check if the user wants us to poll
            if (!this.poll) {
                break;
            }
            if (allChecksPass) {
                break;
            }
            await (0, timeFuncs_1.sleep)(this.pollingInterval * 1000 * 60);
        }
        // create table with results of filtered checks
        let checkSummaryHeader = [{ data: 'name', header: true }, { data: 'status', header: true }, {
                data: 'conclusion',
                header: true
            }, { data: 'started_at', header: true }, { data: 'completed_at', header: true }, {
                data: 'app.name',
                header: true
            }, { data: 'app.id', header: true }];
        let checkSummary = filteredChecksExcludingOwnCheck.map(check => {
            return [check.name, check.status, check.conclusion ? check.conclusion : " ", check.started_at, check.completed_at ? check.completed_at : " ", check.app.name, check.app.id.toString()];
        });
        await core.summary.addHeading("Checks Summary").addTable([
            checkSummaryHeader,
            ...checkSummary
        ]).write();
        // fail the step if the checks did not pass
        if (!allChecksPass) {
            core.setFailed("Some checks have failed or timed out, please check the workflow run summary to get the details");
        }
        if (missingChecks.length > 0) {
            core.warning("Some checks were not found, please check the workflow run summary to get the details");
        }
    }
}
exports.default = Checks;
//# sourceMappingURL=checks.js.map