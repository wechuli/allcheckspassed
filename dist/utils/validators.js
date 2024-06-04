"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIntervalValues = void 0;
function validateIntervalValues(value) {
    if (isNaN(value) || value < 0 || value === Infinity) {
        return 1;
    }
    return value;
}
exports.validateIntervalValues = validateIntervalValues;
//# sourceMappingURL=validators.js.map