/**
 * 带重试机制地执行 promise fn
 *
 * @export
 * @template T
 * @param {() => Promise<T>} promiseFn
 * @param {number} [maxRetryCnt=3]
 * @param {number} [curRetryCnt=0]
 * @returns 异步方法的返回值
 */
export async function retryPromiseFn<T>(promiseFn: () => Promise<T>, maxRetryCnt = 3, curRetryCnt = 0): Promise<T> {
  let retryCnt = curRetryCnt;
  let isRejected = false;
  let result = null;

  try {
    result = await promiseFn();
  } catch (err) {
    isRejected = true;
    retryCnt += 1;

    if (retryCnt >= maxRetryCnt) {
      throw err;
    }
  }

  if (!isRejected) {
    return result as T;
  }
  return retryPromiseFn(promiseFn, maxRetryCnt, retryCnt);
}
