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
exports.sanitizedInputs = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const validators_1 = require("./validators");
function inputsParser() {
    const eventName = github.context.eventName;
    const validPullRequestEvents = ["pull_request", "pull_request_target"];
    let headSha = undefined;
    if (validPullRequestEvents.includes(eventName)) {
        headSha = github.context.payload.pull_request?.head.sha;
    }
    const commitSHA = core.getInput("commit_sha") || headSha || github.context.sha;
    const checksInclude = parseChecksArray(core.getInput("checks_include"));
    const checksExclude = parseChecksArray(core.getInput("checks_exclude"));
    const treatSkippedAsPassed = core.getInput("treat_skipped_as_passed") == "true";
    const createCheck = core.getInput("create_check") == "true";
    const includeCommitStatuses = core.getInput("include_commit_statuses") == "true";
    const poll = core.getInput("poll") == "true";
    const delay = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("delay")));
    const pollingInterval = (0, validators_1.validateIntervalValues)(parseInt(core.getInput("polling_interval")));
    const failStep = core.getInput("fail_step") == "true";
    const failFast = core.getInput("fail_fast") == "true";
    return {
        commitSHA,
        checksInclude,
        checksExclude,
        treatSkippedAsPassed,
        createCheck,
        includeCommitStatuses,
        poll,
        delay,
        pollingInterval,
        failStep,
        failFast,
    };
}
function parseChecksArray(input) {
    try {
        // Return an empty array if the input is "-1"
        if (input === "-1") {
            return [];
        }
        // Trim the input to remove any leading/trailing whitespace
        const trimmedInput = input.trim();
        // Check if the input starts with '[{', indicating a JSON array of objects
        if (trimmedInput.startsWith('[{') && trimmedInput.endsWith('}]')) {
            return JSON.parse(trimmedInput);
        }
        // Check if the input starts with a '{', indicating a JSON-like object
        else if (trimmedInput.startsWith('{')) {
            // Split the string by '},{', then add the missing braces back to each element
            return trimmedInput.split('},{').map(element => {
                if (!element.startsWith('{'))
                    element = '{' + element;
                if (!element.endsWith('}'))
                    element = element + '}';
                return JSON.parse(element);
            });
        }
        // Otherwise, assume it's a comma-separated list
        else {
            return trimmedInput.split(',').map(element => {
                return { name: element.trim(), app_id: -1 };
            });
        }
    }
    catch (error) {
        throw new Error("Error parsing checks array: " + error.message);
    }
}
exports.sanitizedInputs = inputsParser();
//# sourceMappingURL=inputsExtractor.js.map