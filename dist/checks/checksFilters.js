"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterStatusesByState = exports.filterChecksByConclusion = exports.filterChecksByStatus = exports.filterStatusesByContext = exports.filterChecksByName = void 0;
function filterChecksByName(checks, name) {
    const regex = new RegExp(name);
    return checks.filter((check) => regex.test(check.name));
}
exports.filterChecksByName = filterChecksByName;
function filterStatusesByContext(statuses, context) {
    const regex = new RegExp(context);
    return statuses.filter((status) => regex.test(status.context));
}
exports.filterStatusesByContext = filterStatusesByContext;
function filterChecksByStatus(checks, status) {
    return checks.filter((check) => check.status === status);
}
exports.filterChecksByStatus = filterChecksByStatus;
function filterChecksByConclusion(checks, conclusion) {
    return checks.filter((check) => check.conclusion === conclusion);
}
exports.filterChecksByConclusion = filterChecksByConclusion;
function filterStatusesByState(statuses, state) {
    return statuses.filter((status) => status.state === state);
}
exports.filterStatusesByState = filterStatusesByState;
//# sourceMappingURL=checksFilters.js.map