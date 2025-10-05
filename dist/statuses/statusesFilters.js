"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostRecentStatusPerContextAndCreator = getMostRecentStatusPerContextAndCreator;
function getMostRecentStatusPerContextAndCreator(statuses) {
    const statusMap = new Map();
    for (const status of statuses) {
        const key = `${status.context}|${status.creator.login}`;
        const existing = statusMap.get(key);
        if (!existing || status.id > existing.id) {
            statusMap.set(key, status);
        }
    }
    return Array.from(statusMap.values());
}
//# sourceMappingURL=statusesFilters.js.map