export const rewardGoal = 5;

export function getRewardCopy(stamps: number) {
  if (stamps >= rewardGoal) {
    return "Tenés un café gratis listo para canjear.";
  }

  const remaining = rewardGoal - stamps;
  return `${remaining} ${remaining === 1 ? "sello" : "sellos"} para tu próximo café gratis.`;
}
