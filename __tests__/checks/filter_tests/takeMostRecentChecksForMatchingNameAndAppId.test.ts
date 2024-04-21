import {
    takeMostRecentChecksForMatchingNameAndAppId
} from "../../../src/checks/checksFilters";
import {ICheck} from "../../../src/checks/checksInterfaces";
import {checkConclusion, checkStatus} from "../../../src/checks/checksConstants";


const checksData: ICheck[] = [
    {
        id: 1,
        name: "check1",
        status: checkStatus.COMPLETED,
        conclusion: checkConclusion.FAILURE,
        started_at: "2023-06-12T22:25:32Z",
        completed_at: "2023-06-12T22:26:32Z",
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
        app: {
            id: 2,
            slug: "slug2",
            name: "name2",
        },
        check_suite: {
            id: 24342,
        }
    }
];

describe("it should take most recent checks for matching name and app id", () => {

    it("should return empty array if no matching checks are found", () => {
        const expectedOutput: ICheck[] = [checksData[1], checksData[2]];
        expect(takeMostRecentChecksForMatchingNameAndAppId(checksData)).toEqual(expectedOutput);
    });
});