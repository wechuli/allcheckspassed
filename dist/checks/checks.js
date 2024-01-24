"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checksAPI_1 = require("./checksAPI");
const checksFilters_1 = require("./checksFilters");
const fileExtractor_1 = require("../utils/fileExtractor");
const checksConstants_1 = require("./checksConstants");
class Checks {
    // data
    allChecks = [];
    allStatuses = [];
    filteredChecks = [];
    filteredStatuses = [];
    allChecksPassed = false;
    allStatusesPassed = false;
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
    createCheck;
    includeCommitStatuses;
    poll;
    delay;
    retries;
    pollingInterval;
    failStep;
    failFast;
    constructor(props) {
        this.owner = props.owner;
        this.repo = props.repo;
        this.ref = props.commitSHA;
        this.checksExclude = props.checksExclude;
        this.checksInclude = props.checksInclude;
        this.treatSkippedAsPassed = props.treatSkippedAsPassed;
        this.treatNeutralAsPassed = props.treatNeutralAsPassed;
        this.createCheck = props.createCheck;
        this.includeCommitStatuses = props.includeCommitStatuses;
        this.poll = props.poll;
        this.delay = props.delay;
        this.pollingInterval = props.pollingInterval;
        this.failStep = props.failStep;
        this.failFast = props.failFast;
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
    async fetchAllStatusCommits() {
        try {
            this.allStatuses = await (0, checksAPI_1.getAllStatusCommits)(this.owner, this.repo, this.ref);
        }
        catch (error) {
            throw new Error("Error getting all statuses: " + error.message);
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
    async runLogic() {
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
}
exports.default = Checks;
//# sourceMappingURL=checks.js.map