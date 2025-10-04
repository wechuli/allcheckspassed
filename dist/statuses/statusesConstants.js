"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitStatusState = void 0;
exports.addCommitStatusEmoji = addCommitStatusEmoji;
exports.commitStatusState = {
    ERROR: "error",
    FAILURE: "failure",
    PENDING: "pending",
    SUCCESS: "success",
};
const commitStatusStateEmojis = {
    failure: "❌",
    pending: "⏳",
    error: "⚠️",
    success: "✅",
};
function addCommitStatusEmoji(commitStatusState) {
    return commitStatusState + " " + commitStatusStateEmojis[commitStatusState];
}
//# sourceMappingURL=statusesConstants.js.map