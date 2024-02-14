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
exports.sanitizedInputs = exports.validateCheckInputs = exports.isValidCheckInput = exports.parseChecksArray = void 0;
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
    const delay = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("delay")));
    const pollingInterval = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("polling_interval")));
    const retries = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("retries")));
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
        failOnMissingChecks
    };
}
function parseChecksArray(input, inputType = "checks_include") {
    try {
        const trimmedInput = input.trim();
        if (trimmedInput === "-1") {
            return [];
        }
        // attempt to parse as JSON if it starts with { or [
        if (trimmedInput.startsWith("{")) {
            let parsedInput = JSON.parse("[" + trimmedInput + "]");
            if (!validateCheckInputs(parsedInput)) {
                throw new Error();
            }
            return parsedInput;
        }
        if (trimmedInput.startsWith("[")) {
            let parsedInput = JSON.parse(trimmedInput);
            if (!validateCheckInputs(parsedInput)) {
                throw new Error();
            }
            return parsedInput;
        }
        else {
            return trimmedInput.split(',').map(element => {
                return { name: element.trim(), app_id: -1 };
            });
        }
    }
    catch (error) {
        throw new Error(`Error parsing the ${inputType} input, please provide a comma-separated list of check names, or a valid JSON array of objects with the properties "name" and "app_id"`);
    }
}
exports.parseChecksArray = parseChecksArray;
function isValidCheckInput(object) {
    return typeof object.name === 'string' && typeof object.app_id === 'number';
}
exports.isValidCheckInput = isValidCheckInput;
function validateCheckInputs(array) {
    return array.every(isValidCheckInput);
}
exports.validateCheckInputs = validateCheckInputs;
exports.sanitizedInputs = inputsParser();
//# sourceMappingURL=inputsExtractor.js.map