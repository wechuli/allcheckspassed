"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checksAPI_1 = require("./checksAPI");
const checksFilters_1 = require("./checksFilters");
class Checks {
    // data
    allChecks = [];
    allStatuses = [];
    filteredChecks = [];
    filteredStatuses = [];
    allChecksPassed = false;
    allStatusesPassed = false;
    missingChecks = [];
    // inputs
    owner;
    repo;
    ref;
    checksExclude;
    checksInclude;
    treatSkippedAsPassed;
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
            const allChecks = await (0, checksAPI_1.getAllChecks)(this.owner, this.repo, this.ref);
            console.log(`all checks from there: ${JSON.stringify(allChecks)}`);
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
        // start by checking if the user has defined both checks_include and checks_exclude inputs and fail if that is the case
        let ambigousChecks = (0, checksFilters_1.checkOneOfTheChecksInputIsEmpty)(this.checksInclude, this.checksExclude);
        if (!ambigousChecks) {
            throw new Error("You cannot define both checks_include and checks_exclude inputs, please use only one of them");
        }
        // if neither checks_include nor checks_exclude are defined, then we will use all checks
        if (this.checksInclude.length === 0 && this.checksExclude.length === 0) {
            console.log("am here");
            this.filteredChecks = [...this.allChecks];
            return;
        }
        // if only checks_include is defined, then we will use only the checks that are included
        if (!this.checksInclude) {
            let firstPassthrough = (0, checksFilters_1.filterChecksWithMatchingNameAndAppId)(this.allChecks, this.checksInclude);
            // lets separate the object
            let filteredChecks = firstPassthrough["filteredChecks"];
            let missingChecks = firstPassthrough["missingChecks"];
            this.filteredChecks = (0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(filteredChecks);
            this.missingChecks = (0, checksFilters_1.removeDuplicateEntriesChecksInputsFromSelf)(missingChecks);
            return;
        }
        if (!this.checksExclude) {
            let firstPassthrough = (0, checksFilters_1.removeChecksWithMatchingNameAndAppId)(this.allChecks, this.checksExclude);
            this.filteredChecks = (0, checksFilters_1.removeDuplicateChecksEntriesFromSelf)(firstPassthrough);
            return;
        }
    }
    ;
    async runLogic() {
        await this.fetchAllChecks();
        await this.fetchAllStatusCommits();
        await this.filterChecks();
    }
}
exports.default = Checks;
//# sourceMappingURL=checks.js.map