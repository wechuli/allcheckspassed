"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=timeFuncs.js.map