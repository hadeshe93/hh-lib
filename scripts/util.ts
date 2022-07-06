type Target = any;

export async function runParallel(
  maxConcurrency: number,
  targets: Target[],
  iteratorFn: (target: Target, targets: Target[]) => any,
) {
  const ret = [];
  const executing = [];
  for (const item of targets) {
    const p = Promise.resolve().then(() => iteratorFn(item, targets));
    ret.push(p);

    if (maxConcurrency <= targets.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}
