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
exports.sanitizedInputs = void 0;
exports.parseChecksArray = parseChecksArray;
exports.isValidCheckInput = isValidCheckInput;
exports.validateCheckInputs = validateCheckInputs;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const validators_1 = require("./validators");
const checksFilters_1 = require("../checks/checksFilters");
function inputsParser() {
    const eventName = github.context.eventName;
    const validPullRequestEvents = ["pull_request", "pull_request_target"];
    let headSha = undefined;
    if (validPullRequestEvents.includes(eventName)) {
        headSha = github.context.payload.pull_request?.head.sha;
    }
    const commitSHA = core.getInput("commit_sha") || headSha || github.context.sha;
    const checksInclude = (0, checksFilters_1.removeDuplicateEntriesChecksInputsFromSelf)(parseChecksArray(core.getInput("checks_include"), "checks_include"));
    const checksExclude = (0, checksFilters_1.removeDuplicateEntriesChecksInputsFromSelf)(parseChecksArray(core.getInput("checks_exclude"), "checks_exclude"));
    const treatSkippedAsPassed = core.getInput("treat_skipped_as_passed") == "true";
    const treatNeutralAsPassed = core.getInput("treat_neutral_as_passed") == "true";
    const failFast = core.getInput("fail_fast") == "true";
    const failStep = core.getInput("fail_step") == "true";
    const failOnMissingChecks = core.getInput("fail_on_missing_checks") == "true";
    const poll = core.getInput("poll") == "true";
    const delay = (0, validators_1.validateIntervalValues)(parseFloat(core.getInput("delay")));
    const pollingInterval = (0, validators_1.validateIntervalValues)(parseFloat(core.getInput("polling_interval")));
    const retries = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("retries")));
    const verbose = core.getInput("verbose") == "true";
    const showJobSummary = core.getInput("show_job_summary") == "true";
    const checkRunId = parseInt(core.getInput("check_run_id")) || undefined;
    const includeStatusCommits = core.getInput("include_status_commits") == "true";
    return {
        commitSHA,
        checksInclude,
        checksExclude,
        treatSkippedAsPassed,
        treatNeutralAsPassed,
        poll,
        delay,
        pollingInterval,
        retries,
        failFast,
        failStep,
        failOnMissingChecks,
        verbose,
        showJobSummary,
        checkRunId,
        includeStatusCommits,
    };
}
function parseChecksArray(input, inputType = "checks_include") {
    try {
        const trimmedInput = input.trim();
        let checks = [];
        if (trimmedInput === "-1") {
            return [];
        }
        // attempt to parse as JSON if it starts with { or [
        if (trimmedInput.startsWith("{")) {
            checks = JSON.parse("[" + trimmedInput + "]");
        }
        else if (trimmedInput.startsWith("[")) {
            checks = JSON.parse(trimmedInput);
        }
        else {
            // Split by commas.
            checks = trimmedInput.split(",").map((element) => {
                return { name: element.trim(), app_id: -1 };
            });
        }
        // Remove checks with no filtering ability
        checks = checks.filter((c) => c.app_id !== -1 || c.name !== "");
        if (!validateCheckInputs(checks)) {
            throw new Error();
        }
        return checks;
    }
    catch (error) {
        throw new Error(`Error parsing the ${inputType} input, please provide a comma-separated list of check names, or a valid JSON array of objects with the properties "name" and "app_id"`);
    }
}
function isValidCheckInput(object) {
    return typeof object.name === "string" && typeof object.app_id === "number";
}
function validateCheckInputs(array) {
    return array.every(isValidCheckInput);
}
exports.sanitizedInputs = inputsParser();
//# sourceMappingURL=inputsExtractor.js.map