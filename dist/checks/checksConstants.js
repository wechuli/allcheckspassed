"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubActionsBotId = exports.commitStatusState = exports.checkStatus = exports.checkConclusion = void 0;
var checkConclusion;
(function (checkConclusion) {
    checkConclusion["ACTION_REQUIRED"] = "action_required";
    checkConclusion["CANCELLED"] = "cancelled";
    checkConclusion["FAILURE"] = "failure";
    checkConclusion["NEUTRAL"] = "neutral";
    checkConclusion["SUCCESS"] = "success";
    checkConclusion["SKIPPED"] = "skipped";
    checkConclusion["STALE"] = "stale";
    checkConclusion["TIMED_OUT"] = "timed_out";
})(checkConclusion || (exports.checkConclusion = checkConclusion = {}));
var checkStatus;
(function (checkStatus) {
    checkStatus["QUEUED"] = "queued";
    checkStatus["IN_PROGRESS"] = "in_progress";
    checkStatus["COMPLETED"] = "completed";
})(checkStatus || (exports.checkStatus = checkStatus = {}));
var commitStatusState;
(function (commitStatusState) {
    commitStatusState["ERROR"] = "error";
    commitStatusState["FAILURE"] = "failure";
    commitStatusState["PENDING"] = "pending";
    commitStatusState["SUCCESS"] = "success";
})(commitStatusState || (exports.commitStatusState = commitStatusState = {}));
exports.GitHubActionsBotId = 15;
//# sourceMappingURL=checksConstants.js.map