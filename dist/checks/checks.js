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
        // lets get the check from the workflow run itself
        let ownCheckName = await (0, fileExtractor_1.extractOwnCheckNameFromWorkflow)();
        let gitHubActionsBotId = checksConstants_1.GitHubActionsBotId;
        this.ownCheck = this.allChecks.find(check => check.name === ownCheckName && check.app.id === gitHubActionsBotId);
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
    reportChecks() {
        // create table showing the filtered checks, with names and conclusion, created at, updated at, and app id and status
        core.info("Filtered checks:");
        core.info("Name | Conclusion | Created at | Updated at |  | Status");
    }
    ;
    async runLogic() {
        (0, timeFuncs_1.sleep)(this.delay);
        await this.fetchAllChecks();
        await this.filterChecks();
    }
}
exports.default = Checks;
//# sourceMappingURL=checks.js.map