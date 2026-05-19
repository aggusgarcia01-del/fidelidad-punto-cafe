export const rewardGoal = 5;

export function getRewardCopy(stamps: number) {
  if (stamps >= rewardGoal) {
    return "Tenes un cafe gratis listo para canjear.";
  }

  const remaining = rewardGoal - stamps;
  return `${remaining} ${remaining === 1 ? "sello" : "sellos"} para tu proximo cafe gratis.`;
}
