import { InvalidArgumentError } from 'commander';

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

export function myParseInt(value: string, dummyPrevious: number): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}
