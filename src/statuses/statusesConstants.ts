export const commitStatusState = {
  ERROR: "error",
  FAILURE: "failure",
  PENDING: "pending",
  SUCCESS: "success",
};

interface ICommitStatusEmoji {
  [key: string]: string;
}

const commitStatusStateEmojis: ICommitStatusEmoji = {
  failure: "❌",
  pending: "⏳",
  error: "⚠️",
  success: "✅",
};

export function addCommitStatusEmoji(commitStatusState: string): string {
  return commitStatusState + " " + commitStatusStateEmojis[commitStatusState];
}
