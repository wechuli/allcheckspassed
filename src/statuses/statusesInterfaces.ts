export interface IStatus {
  id: number;
  context: string;
  state: string;
  creator: {
    login: string;
    id: number;
  };
  created_at: string;
  updated_at: string;
}
