export interface ICheck {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    started_at: string;
    completed_at: string | null;
    details_url: string;
    check_suite: {
        id: number;
    }
    app: {
        id: number;
        slug: string;
        name: string;
    }

}

export interface IStatus {
    context: string;
    state: string;
    creator: {
        login: string;
        id: number;
    },
    created_at: string;
    updated_at: string;
}

export interface ICheckInput {
    name: string;
    app_id: number;
}

export interface IDetermineChecksStatus {
    in_progress: boolean;
    passed: boolean;
}