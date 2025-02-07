"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIntervalValues = validateIntervalValues;
function validateIntervalValues(value) {
    if (isNaN(value) || value < 0 || value === Infinity) {
        return 1;
    }
    return value;
}
//# sourceMappingURL=validators.js.map