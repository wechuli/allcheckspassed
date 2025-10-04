interface IEmoji {
  [key: string]: string;
}

const checkConclusionEmojis: IEmoji = {
  action_required: "🔶",
  cancelled: "🚫",
  failure: "❌",
  neutral: "⚪",
  success: "✅",
  skipped: "⏭️",
  stale: "🔄",
  timed_out: "⌛",
};

export function addCheckConclusionEmoji(checkConclusion: string): string {
  return checkConclusion + " " + checkConclusionEmojis[checkConclusion];
}
