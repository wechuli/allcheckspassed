import {ICheck, IStatus, ICheckInput} from './checksInterfaces';
import {checkStatus} from "./checksConstants";

export enum FilterTypes {
    exclude = "exclude",
    include = "include"
}


export function returnChecksWithMatchingNameAndAppId(checks: ICheck[], name: string, appId: number): ICheck[] | null {
    const regex = new RegExp(name);
    let checksWithNameAndAppID: ICheck[] = [];
    //if appId is -1, then we don't care about the app id, just the name
    if (appId === -1) {
        checksWithNameAndAppID = checks.filter((check) => regex.test(check.name));
    } else {
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

export function filterChecksWithMatchingNameAndAppId(checks: ICheck[], checksInputs: ICheckInput[]) {
    let missingChecks: ICheckInput[] = [];
    let filteredChecksRaw: ICheck[] = [];
    checksInputs.forEach(checkInput => {
        const checksWithNameAndAppId = returnChecksWithMatchingNameAndAppId(checks, checkInput.name, checkInput.app_id);
        if (checksWithNameAndAppId === null) {
            missingChecks.push(checkInput);
        } else {
            filteredChecksRaw = [...filteredChecksRaw, ...checksWithNameAndAppId];
        }
    });
    // at this point, filtered checks may have checks with the same name and app_id, we need to pick the most recent check using the check id

    const mostRecentChecks = takeMostRecentChecksForMatchingNameAndAppId(filteredChecksRaw);
    return {filteredChecks: mostRecentChecks, missingChecks};
}

export function takeMostRecentChecksForMatchingNameAndAppId(checks: ICheck[]): ICheck[] {
    const getUniqueAppId = [...new Set(checks.map((check) => check.app.id))];
    let mostRecentChecks: ICheck[] = [];

    getUniqueAppId.forEach((appId) => {
        const checksWithMatchingAppId = checks.filter((check) => check.app.id === appId);

        // we may have used regular expressions to get here, so we need to make sure that the checks we are comparing are actually the same
        const getUniqueCheckName = [...new Set(checksWithMatchingAppId.map((check) => check.name))];
        getUniqueCheckName.forEach((checkName) => {
            const checksWithMatchingName = checksWithMatchingAppId.filter((check) => check.name === checkName);
            const mostRecentCheck = checksWithMatchingName.reduce((prev, current) => (prev.id > current.id) ? prev : current);
            mostRecentChecks.push(mostRecentCheck);
        });

    });
    return mostRecentChecks;
}


export function removeChecksWithMatchingNameAndAppId(checks: ICheck[], checksInputs: ICheckInput[]) {

    let newChecks = [...checks];
    newChecks.forEach(check => {
        checksInputs.forEach(checkInput => {
            const regex = new RegExp(checkInput.name);
            if (checkInput.app_id === -1) {
                if (regex.test(check.name)) {
                    newChecks = newChecks.filter((newCheck) => newCheck.id !== check.id);
                }
            } else {
                if (regex.test(check.name) && checkInput.app_id === check.app.id) {
                    newChecks = newChecks.filter((newCheck) => newCheck.id !== check.id);
                }
            }
        });

    });
    return newChecks;
}

export function checkOneOfTheChecksInputIsEmpty(checksInputs1: ICheckInput[], checksInputs2: ICheckInput[]): boolean {

    if (checksInputs1.length === 0 || checksInputs2.length === 0) {
        return true;
    }
    return false;
}

export function removeDuplicateEntriesChecksInputsFromSelf(checksInputs: ICheckInput[]): ICheckInput[] {
    let uniqueCheckInputs: ICheckInput[] = [];
    checksInputs.forEach((checkInput) => {
        const checkInputAlreadyExists = uniqueCheckInputs.some((uniqueCheckInput) => uniqueCheckInput.name === checkInput.name && uniqueCheckInput.app_id === checkInput.app_id);
        if (!checkInputAlreadyExists) {
            uniqueCheckInputs.push(checkInput);
        }
    });
    return uniqueCheckInputs;
}

export function removeDuplicateChecksEntriesFromSelf(checks: ICheck[]): ICheck[] {
    // use the check id to determine uniqueness
    let uniqueChecks: ICheck[] = [];
    checks.forEach((check) => {
        const checkAlreadyExists = uniqueChecks.some((uniqueCheck) => uniqueCheck.id === check.id);
        if (!checkAlreadyExists) {
            uniqueChecks.push(check);
        }
    });
    return uniqueChecks;
}


export function filterChecksByStatus(checks: ICheck[], status: string) {
    return checks.filter((check) => check.status === status);
}

export function filterChecksByConclusion(checks: ICheck[], conclusion: string) {
    return checks.filter((check) => check.conclusion === conclusion);
}

