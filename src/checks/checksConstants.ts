
export enum checkConclusion{
    ACTION_REQUIRED = "action_required",
    CANCELLED = "cancelled",
    FAILURE = "failure",
    NEUTRAL = "neutral",
    SUCCESS = "success",
    SKIPPED = "skipped",
    STALE = "stale",
    TIMED_OUT = "timed_out"
}

export enum checkStatus{
    QUEUED = "queued",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}


export enum commitStatusState{
    ERROR = "error",
    FAILURE = "failure",
    PENDING = "pending",
    SUCCESS = "success"
}

