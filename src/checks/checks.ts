
import { IInputs} from '../utils/inputsExtractor';
import {getAllChecks,getAllStatusCommits} from './checksAPI';
import { ICheckInput,ICheck,IStatus } from './checksInterfaces';
import {
    checkOneOfTheChecksInputIsEmpty,
    filterChecksWithMatchingNameAndAppId,
    removeChecksWithMatchingNameAndAppId,
    removeDuplicateChecksEntriesFromSelf,
    removeDuplicateEntriesChecksInputsFromSelf
} from './checksFilters';

interface IRepo{
    owner: string;
    repo: string;
}

export default class Checks{
    // data
    private allChecks: ICheck[] = [];
    private allStatuses: IStatus[] = [];
    public filteredChecks: ICheck[] = [];
    private filteredStatuses: IStatus[] = [];
    private allChecksPassed: boolean = false;
    private allStatusesPassed: boolean = false;
    private missingChecks: ICheckInput[] = [];

    // inputs
    private owner: string;
    private repo: string;
    private ref: string;
    private checksExclude: ICheckInput[];
    private checksInclude: ICheckInput[];
    private treatSkippedAsPassed: boolean;
    private createCheck: boolean;
    private includeCommitStatuses: boolean;
    private poll: boolean;
    private delay: number;
    private retries: number;
    private pollingInterval: number;
    private failStep: boolean;
    private failFast: boolean;


    constructor(props: IRepo & IInputs){
        this.owner = props.owner;
        this.repo = props.repo;
        this.ref = props.commitSHA;
        this.checksExclude = props.checksExclude;
        this.checksInclude = props.checksInclude;
        this.treatSkippedAsPassed = props.treatSkippedAsPassed;
        this.createCheck = props.createCheck;
        this.includeCommitStatuses = props.includeCommitStatuses;
        this.poll = props.poll;
        this.delay = props.delay;
        this.pollingInterval = props.pollingInterval;
        this.failStep = props.failStep;
        this.failFast = props.failFast;
        this.retries = props.retries;

    }

    async fetchAllChecks(){
        try {
            this.allChecks = await getAllChecks(this.owner, this.repo, this.ref) as ICheck[];
        } catch (error: any) {
            throw new Error("Error getting all checks: " + error.message);
        }
    }

    async fetchAllStatusCommits(){
        try {
            this.allStatuses = await getAllStatusCommits(this.owner, this.repo, this.ref) as IStatus[];
        } catch (error: any) {
            throw new Error("Error getting all statuses: " + error.message);
        }
    }

    async filterChecks(){
        // start by checking if the user has defined both checks_include and checks_exclude inputs and fail if that is the case
        let ambigousChecks = checkOneOfTheChecksInputIsEmpty(this.checksInclude,this.checksExclude);
        if(!ambigousChecks){
            throw new Error("You cannot define both checks_include and checks_exclude inputs, please use only one of them");
        }
        // if neither checks_include nor checks_exclude are defined, then we will use all checks

        if(this.checksInclude.length === 0 && this.checksExclude.length === 0){

            this.filteredChecks = [...this.allChecks];
            return;
        }

        // if only checks_include is defined, then we will use only the checks that are included
        if(!this.checksInclude){
            let firstPassthrough = filterChecksWithMatchingNameAndAppId(this.allChecks,this.checksInclude);
            // lets separate the object

            let filteredChecks = firstPassthrough["filteredChecks"];
            let missingChecks = firstPassthrough["missingChecks"];

            this.filteredChecks = removeDuplicateChecksEntriesFromSelf(filteredChecks);
            this.missingChecks = removeDuplicateEntriesChecksInputsFromSelf(missingChecks);
        }

        if(!this.checksExclude){
let firstPassthrough =removeChecksWithMatchingNameAndAppId(this.allChecks,this.checksExclude);
this.filteredChecks = removeDuplicateChecksEntriesFromSelf(firstPassthrough);
        }

    };

    async runLogic(){
        await this.fetchAllChecks();
        await this.fetchAllStatusCommits();
        await this.filterChecks();
    }



}
