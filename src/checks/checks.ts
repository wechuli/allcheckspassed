
import { IInputs} from '../utils/inputsExtractor';
import { restClient } from '../utils/octokit';
import {getAllChecks,getAllStatusCommits,createCheckRun} from './checksAPI';
import { ICheckInput,ICheck,IStatus } from './checksInterfaces';

interface IRepo{
    owner: string;
    repo: string;
}

export class Checks{
    // data
    private allChecks: ICheck[] = [];
    private allStatuses: IStatus[] = [];
    private filteredChecks: ICheck[] = [];
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

}
