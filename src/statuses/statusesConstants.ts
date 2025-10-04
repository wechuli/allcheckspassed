export const commitStatusState = {
  ERROR: "error",
  FAILURE: "failure",
  PENDING: "pending",
  SUCCESS: "success",
};

interface ICommitStatuseEmoji {
  [key: string]: string;
}

const commitStatusStateEmojis: ICommitStatuseEmoji = {
  failure: "❌",
  pending: "⏳",
  error: "⚠️",
  success: "✅",
};

export function addCommitStatusEmoji(commitStatusState: string): string {
  return commitStatusState + " " + commitStatusStateEmojis[commitStatusState];
}
