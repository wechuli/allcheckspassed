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
    const checksInclude = core.getInput("checks_include") == "-1" ? [] : core.getInput("checks_include").split(",");
    const checksExclude = core.getInput("checks_exclude") == "-1" ? [] : core.getInput("checks_exclude").split(",");
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
exports.sanitizedInputs = inputsParser();
//# sourceMappingURL=inputsExtractor.js.map