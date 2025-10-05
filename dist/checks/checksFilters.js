"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterTypes = void 0;
exports.returnChecksWithMatchingNameAndAppId = returnChecksWithMatchingNameAndAppId;
exports.filterChecksWithMatchingNameAndAppId = filterChecksWithMatchingNameAndAppId;
exports.takeMostRecentChecksForMatchingNameAndAppId = takeMostRecentChecksForMatchingNameAndAppId;
exports.removeChecksWithMatchingNameAndAppId = removeChecksWithMatchingNameAndAppId;
exports.checkOneOfTheChecksInputIsEmpty = checkOneOfTheChecksInputIsEmpty;
exports.removeDuplicateEntriesChecksInputsFromSelf = removeDuplicateEntriesChecksInputsFromSelf;
exports.removeDuplicateChecksEntriesFromSelf = removeDuplicateChecksEntriesFromSelf;
exports.filterChecksByStatus = filterChecksByStatus;
exports.filterChecksByConclusion = filterChecksByConclusion;
var FilterTypes;
(function (FilterTypes) {
    FilterTypes["exclude"] = "exclude";
    FilterTypes["include"] = "include";
})(FilterTypes || (exports.FilterTypes = FilterTypes = {}));
function returnChecksWithMatchingNameAndAppId(checks, name, appId) {
    const regex = new RegExp(name);
    let checksWithNameAndAppID = [];
    //if appId is -1, then we don't care about the app id, just the name
    if (appId === -1) {
        checksWithNameAndAppID = checks.filter((check) => regex.test(check.name));
    }
    else {
        checksWithNameAndAppID = checks.filter((check) => regex.test(check.name) && check.app.id === appId);
    }
    //if no check is found, return null
    if (checksWithNameAndAppID.length === 0) {
        return null;
    }
    // if there is only one check with the name and app id, return it
    else if (checksWithNameAndAppID.length === 1) {
        return checksWithNameAndAppID;
    }
    //     if there are multiple checks with the same name, use the app id to pick the most recent check on each unique app id
    return takeMostRecentChecksForMatchingNameAndAppId(checksWithNameAndAppID);
}
function filterChecksWithMatchingNameAndAppId(checks, checksInputs) {
    let missingChecks = [];
    let filteredChecksRaw = [];
    checksInputs.forEach((checkInput) => {
        const checksWithNameAndAppId = returnChecksWithMatchingNameAndAppId(checks, checkInput.name, checkInput.app_id);
        if (checksWithNameAndAppId === null) {
            missingChecks.push(checkInput);
        }
        else {
            filteredChecksRaw = [...filteredChecksRaw, ...checksWithNameAndAppId];
        }
    });
    // at this point, filtered checks may have checks with the same name and app_id, we need to pick the most recent check using the check id
    const mostRecentChecks = takeMostRecentChecksForMatchingNameAndAppId(filteredChecksRaw);
    return { filteredChecks: mostRecentChecks, missingChecks };
}
function takeMostRecentChecksForMatchingNameAndAppId(checks) {
    const getUniqueAppId = [...new Set(checks.map((check) => check.app.id))];
    let mostRecentChecks = [];
    getUniqueAppId.forEach((appId) => {
        const checksWithMatchingAppId = checks.filter((check) => check.app.id === appId);
        // we may have used regular expressions to get here, so we need to make sure that the checks we are comparing are actually the same
        const getUniqueCheckName = [
            ...new Set(checksWithMatchingAppId.map((check) => check.name)),
        ];
        getUniqueCheckName.forEach((checkName) => {
            const checksWithMatchingName = checksWithMatchingAppId.filter((check) => check.name === checkName);
            const mostRecentCheck = checksWithMatchingName.reduce((prev, current) => prev.id > current.id ? prev : current);
            mostRecentChecks.push(mostRecentCheck);
        });
    });
    return mostRecentChecks;
}
function removeChecksWithMatchingNameAndAppId(checks, checksInputs) {
    let newChecks = [...checks];
    newChecks.forEach((check) => {
        checksInputs.forEach((checkInput) => {
            const regex = new RegExp(checkInput.name);
            if (checkInput.app_id === -1) {
                if (regex.test(check.name)) {
                    newChecks = newChecks.filter((newCheck) => newCheck.id !== check.id);
                }
            }
            else {
                if (regex.test(check.name) && checkInput.app_id === check.app.id) {
                    newChecks = newChecks.filter((newCheck) => newCheck.id !== check.id);
                }
            }
        });
    });
    return newChecks;
}
function checkOneOfTheChecksInputIsEmpty(checksInputs1, checksInputs2) {
    if (checksInputs1.length === 0 || checksInputs2.length === 0) {
        return true;
    }
    return false;
}
function removeDuplicateEntriesChecksInputsFromSelf(checksInputs) {
    let uniqueCheckInputs = [];
    checksInputs.forEach((checkInput) => {
        const checkInputAlreadyExists = uniqueCheckInputs.some((uniqueCheckInput) => uniqueCheckInput.name === checkInput.name &&
            uniqueCheckInput.app_id === checkInput.app_id);
        if (!checkInputAlreadyExists) {
            uniqueCheckInputs.push(checkInput);
        }
    });
    return uniqueCheckInputs;
}
function removeDuplicateChecksEntriesFromSelf(checks) {
    // use the check id to determine uniqueness
    let uniqueChecks = [];
    checks.forEach((check) => {
        const checkAlreadyExists = uniqueChecks.some((uniqueCheck) => uniqueCheck.id === check.id);
        if (!checkAlreadyExists) {
            uniqueChecks.push(check);
        }
    });
    return uniqueChecks;
}
function filterChecksByStatus(checks, status) {
    return checks.filter((check) => check.status === status);
}
function filterChecksByConclusion(checks, conclusion) {
    return checks.filter((check) => check.conclusion === conclusion);
}
//# sourceMappingURL=checksFilters.js.map