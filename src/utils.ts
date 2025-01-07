export function calculateLimits(total: number, maxLimit: number): number[] {
  const limits: number[] = [];

  while (total > 0) {
    if (total > maxLimit) {
      limits.push(maxLimit);
      total -= maxLimit;
    } else {
      limits.push(total);
      break;
    }
  }

  return limits;
}
