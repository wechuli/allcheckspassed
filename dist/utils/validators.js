"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIntervalValues = void 0;
function validateIntervalValues(value) {
    const maxInterval = 360;
    if (isNaN(value) || value < 0) {
        return 1;
    }
    if (value > maxInterval) {
        return maxInterval;
    }
    return value;
}
exports.validateIntervalValues = validateIntervalValues;
//# sourceMappingURL=validators.js.map