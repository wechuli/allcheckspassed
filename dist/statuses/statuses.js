"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStatusesToChecksModel = mapStatusesToChecksModel;
function mapStatusesToChecksModel(statuses) {
    const checks = statuses.map((status) => ({
        id: status.id,
        name: status.context,
        status: status.state === "pending" ? "in_progress" : "completed",
        conclusion: status.state === "success"
            ? "success"
            : status.state === "failure"
                ? "failure"
                : status.state === "error"
                    ? "failure"
                    : null,
        started_at: status.created_at,
        completed_at: status.state === "pending" ? null : status.updated_at,
        check_suite: {
            id: 0, // Placeholder as GitHub Status API does not provide check_suite ID
        },
        app: {
            id: status.creator.id,
            slug: status.creator.login,
            name: status.creator.login,
        },
        commit_status: status,
    }));
    return checks;
}
//# sourceMappingURL=statuses.js.map