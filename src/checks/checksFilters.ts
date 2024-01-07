import { ICheck,IStatus} from './checksInterfaces';
export function filterChecksByName(checks:ICheck[], name:string) {
    const regex = new RegExp(name);
    return checks.filter((check) => regex.test(check.name));
}

export function filterStatusesByContext(statuses:IStatus[], context:string) {
    const regex = new RegExp(context);
    return statuses.filter((status) => regex.test(status.context));
}

export function filterChecksByStatus(checks:ICheck[], status:string) {
    return checks.filter((check) => check.status === status);
}

export function filterChecksByConclusion(checks:ICheck[], conclusion:string) {
    return checks.filter((check) => check.conclusion === conclusion);
}

export function filterStatusesByState(statuses:IStatus[], state:string) {
    return statuses.filter((status) => status.state === state);
}