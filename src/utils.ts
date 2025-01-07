import { InvalidArgumentError } from 'commander';

export function calculateLimits(total: number): number[] {
  const limits: number[] = [];
  const maxLimit = 100;

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
