
import { IInputs} from '../utils/inputsExtractor';
import { restClient } from '../utils/octokit';
import {getAllChecks,getAllStatusCommits,createCheckRun} from './checksAPI';

interface IRepo{
    owner: string;
    repo: string;
}

class Checks{
    // data
    private allChecks: any;
    private allStatuses: any;
    private allChecksPassed: boolean = false;
    private allStatusesPassed: boolean = false;

    // inputs
    private owner: string;
    private repo: string;
    private ref: string;
    private checksExclude: string[];
    private checksInclude: string[];
    private treatSkippedAsPassed: boolean;
    private createCheck: boolean;
    private includeCommitStatuses: boolean;
    private poll: boolean;
    private delay: number;
    private pollingInterval: number;
    private failStep: boolean;

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

    }

    async fetchAllChecks(){
        try {
            this.allChecks = await getAllChecks(this.owner, this.repo, this.ref);
        } catch (error: any) {
            throw new Error("Error getting all checks: " + error.message);
        }
    }

    async fetchAllStatusCommits(){
        try {
            this.allStatuses = await getAllStatusCommits(this.owner, this.repo, this.ref);
        } catch (error: any) {
            throw new Error("Error getting all statuses: " + error.message);
        }
    }

}
