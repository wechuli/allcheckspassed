"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCheckConclusionEmoji = void 0;
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
    return checkConclusion + checkConclusionEmojis[checkConclusion];
}
exports.addCheckConclusionEmoji = addCheckConclusionEmoji;
//# sourceMappingURL=checkEmoji.js.map