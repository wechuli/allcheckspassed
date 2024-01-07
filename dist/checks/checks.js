"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checksAPI_1 = require("./checksAPI");
class Checks {
    // data
    allChecks;
    allStatuses;
    allChecksPassed = false;
    allStatusesPassed = false;
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
    pollingInterval;
    failStep;
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
}
//# sourceMappingURL=checks.js.map