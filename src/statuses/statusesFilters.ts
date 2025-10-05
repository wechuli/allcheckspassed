import { IStatus } from "./statusesInterfaces";

export function getMostRecentStatusPerContextAndCreator(
  statuses: IStatus[]
): IStatus[] {
  const statusMap = new Map<string, IStatus>();

  for (const status of statuses) {
    const key = `${status.context}|${status.creator.login}`;
    const existing = statusMap.get(key);
    if (!existing || status.id > existing.id) {
      statusMap.set(key, status);
    }
  }
  return Array.from(statusMap.values());
}
