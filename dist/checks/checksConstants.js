"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubActionsBotId = exports.commitStatusState = exports.checkStatus = exports.checkConclusion = void 0;
exports.checkConclusion = {
    ACTION_REQUIRED: "action_required",
    CANCELLED: "cancelled",
    FAILURE: "failure",
    NEUTRAL: "neutral",
    SUCCESS: "success",
    SKIPPED: "skipped",
    STALE: "stale",
    TIMED_OUT: "timed_out"
};
exports.checkStatus = {
    QUEUED: "queued",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    WAITING: "waiting"
};
exports.commitStatusState = {
    ERROR: "error",
    FAILURE: "failure",
    PENDING: "pending",
    SUCCESS: "success"
};
exports.GitHubActionsBotId = 15368;
//# sourceMappingURL=checksConstants.js.map