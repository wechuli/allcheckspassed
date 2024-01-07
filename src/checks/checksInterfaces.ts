export interface  ICheck{
    name: string;
    status: string;
    conclusion: string;
    started_at: string;
    completed_at: string;
    app:{
        id: number;
        slug: string;
        name: string;
    }

}

export interface IStatus{
    context: string;
    state: string;
    creator:{
        login:string;
        id: number;
    },
    created_at: string;
    updated_at: string;
}

export interface ICheckInput{
    name: string;
    app_id: number;
}