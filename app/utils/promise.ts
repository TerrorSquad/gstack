// Type guards for narrowing Promise.allSettled() results.
export function isFulfilled<T>(
  value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> {
  return value.status === 'fulfilled'
}

export function isRejected<T>(value: PromiseSettledResult<T>): value is PromiseRejectedResult {
  return value.status === 'rejected'
}
