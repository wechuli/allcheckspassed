"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCheckConclusionEmoji = addCheckConclusionEmoji;
const checkConclusionEmojis = {
    "action_required": "🔶",
    "cancelled": "🚫",
    "failure": "❌",
    "neutral": "⚪",
    "success": "✅",
    "skipped": "⏭️",
    "stale": "🔄",
    "timed_out": "⌛"
};
function addCheckConclusionEmoji(checkConclusion) {
    return checkConclusion + " " + checkConclusionEmojis[checkConclusion];
}
//# sourceMappingURL=checkEmoji.js.map