import {
    FilterTypes,
    checkOneOfTheChecksInputIsEmpty,
    removeDuplicateEntriesChecksInputsFromSelf,
    removeChecksWithMatchingNameAndAppId,
    returnChecksWithMatchingNameAndAppId,
    filterChecksWithMatchingNameAndAppId,
    removeDuplicateChecksEntriesFromSelf
} from "../../../src/checks/checksFilters";
import {ICheck, ICheckInput} from "../../../src/checks/checksInterfaces";
import {checkStatus, checkConclusion, commitStatusState} from "../../../src/checks/checksConstants";


const checksData: ICheck[] = [
    {
        id: 1,
        name: "check1",
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.FAILURE,
        started_at: "2023-06-12T22:25:32Z",
        completed_at: "2023-06-12T22:26:32Z",
        details_url: "details_url1",
        app: {
            id: 1,
            slug: "slug1",
            name: "name1",
        },
        check_suite: {
            id: 142233,
        }
    },
    {
        id: 3,
        name: "check1",
        status: checkStatus.IN_PROGRESS,
        conclusion: null,
        started_at: "started_at3",
        completed_at: "completed_at3",
        details_url: "details_url3",
        app: {
            id: 1,
            slug: "slug3",
            name: "name3",
        },
        check_suite: {
            id: 1,
        }
    },
    {
        id: 2,
        name: "check2",
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.FAILURE,
        started_at: "started_at2",
        completed_at: "completed_at2",
        details_url: "details_url2",
        app: {
            id: 2,
            slug: "slug2",
            name: "name2",
        },
        check_suite: {
            id: 24342,
        }
    },
    {
        id: 4,
        name: "check4",
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.SUCCESS,
        started_at: "started_at4",
        completed_at: "completed_at4",
        details_url: "details_url4",
        app: {
            id: 2,
            slug: "slug4",
            name: "name4",
        },
        check_suite: {
            id: 355,
        }
    },
    {
        id: 5,
        name: "check2",
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.FAILURE,
        started_at: "started_at2",
        completed_at: "completed_at2",
        details_url: "details_url2",
        app: {
            id: 3,
            slug: "slug2",
            name: "name2",
        },
        check_suite: {
            id: 23,
        }
    }


];

describe("filterChecksWithMatchingNameAndAppId", () => {
    it("should return checks with matching name and app id", () => {
        let input: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];
        let expected = {filteredChecks: [checksData[1], checksData[2]], missingChecks: []};

        expect(filterChecksWithMatchingNameAndAppId(checksData, input)).toStrictEqual(expected);
    });

    it("should return missing checks if checks with matching name and app id are not found", () => {
        let input: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check3"}];
        let expected = {filteredChecks: [checksData[1]], missingChecks: [{app_id: 2, name: "check3"}]};
    });
});

describe("returnChecksWithMatchingNameAndAppId", () => {
    it("should return checks with matching name and app id", () => {
        let input: ICheckInput = {app_id: 1, name: "check1"};
        let expected: ICheck[] = [checksData[1]];

        expect(returnChecksWithMatchingNameAndAppId(checksData, input.name, input.app_id)).toStrictEqual(expected);
    });

    it("returns unique checks if checks from each app if there are multiple checks with the same name", () => {
        let input: ICheckInput = {app_id: -1, name: "check2"};
        let expected: ICheck[] = [checksData[2], checksData[4]];

        expect(returnChecksWithMatchingNameAndAppId(checksData, input.name, input.app_id)).toStrictEqual(expected);
    });

    it("should correctly handle regular expressions", () => {
        let input: ICheckInput = {app_id: -1, name: "check."};
        let expected: ICheck[] = [checksData[1], checksData[2], checksData[3], checksData[4]];

        expect(returnChecksWithMatchingNameAndAppId(checksData, input.name, input.app_id)).toStrictEqual(expected);
    });

    it("should return null if no checks match the input", () => {
        let input: ICheckInput = {app_id: 1000, name: "check1"};
        let expected = null;
        expect(returnChecksWithMatchingNameAndAppId(checksData, input.name, input.app_id)).toStrictEqual(expected);
    });
});


describe("checkOneOfTheChecksInputIsEmpty", () => {
    it("should pass if one of the input checks is empty", () => {
        let input1: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];
        let input2: ICheckInput[] = [];

        expect(checkOneOfTheChecksInputIsEmpty(input1, input2)).toBe(true)

    });
    it("should throw an error if both of the input checks are not empty", () => {
        let input1: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];
        let input2: ICheckInput[] = [{app_id: 3, name: "check3"}, {app_id: 4, name: "check4"}];

        expect(checkOneOfTheChecksInputIsEmpty(input1, input2)).toBe(false);

    });

});

describe("removeDuplicateEntries", () => {
    it("it should return check inputs as is if no duplicates exist", () => {
            let input: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];


            expect(removeDuplicateEntriesChecksInputsFromSelf(input)).toStrictEqual(input);

        }
    );

    it("it should remove duplicate entries", () => {
        let input: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}, {
            app_id: 1,
            name: "check1"
        }];
        let expectedOutput: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];
        expect(removeDuplicateEntriesChecksInputsFromSelf(input)).toStrictEqual(expectedOutput);
    });
});

describe("removeChecksWithMatchingNameAndAppId", () => {
    it("should remove checks with matching name and app id", () => {
        let input: ICheckInput[] = [{app_id: 1, name: "check1"}, {app_id: 2, name: "check2"}];
        let expectedOutput = [checksData[3], checksData[4]];

        expect(removeChecksWithMatchingNameAndAppId(checksData, input)).toStrictEqual(expectedOutput);
    });

    it("should remove all checks if all checks match the input", () => {
        let input: ICheckInput[] = [{app_id: -1, name: "check."}];
        let expectedOutput: ICheck[] = [];

        expect(removeChecksWithMatchingNameAndAppId(checksData, input)).toStrictEqual(expectedOutput);
    })

    it("should return checks as is if no checks match the input", () => {
        let input: ICheckInput[] = [{app_id: 1000, name: "check1"}];
        let expectedOutput: ICheck[] = checksData;

        expect(removeChecksWithMatchingNameAndAppId(checksData, input)).toStrictEqual(expectedOutput);
    })
});

describe("removeDuplicateChecksEntriesFromSelf", () => {
    it("it should return checks as is if no duplicates exist", () => {
        let input: ICheck[] = [checksData[0], checksData[1], checksData[2]];
        expect(removeDuplicateChecksEntriesFromSelf(input)).toStrictEqual(input);
    });

    it("it should remove duplicate entries", () => {
        let input: ICheck[] = [checksData[0], checksData[1], checksData[2], checksData[0]];
        let expectedOutput: ICheck[] = [checksData[0], checksData[1], checksData[2]];
        expect(removeDuplicateChecksEntriesFromSelf(input)).toStrictEqual(expectedOutput);
    });
});