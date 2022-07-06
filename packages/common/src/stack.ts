export interface IParsedCallStack {
  functionName: string;
  filename: string;
  lineNumber: number;
  columnNumber: number;
  callStack: string;
}

/**
 * 解析调用栈信息
 *
 * @export
 * @param {Error} [error=new Error()] 错误实例
 * @param {number} [skipIndex=1]
 * @returns 调用栈详细信息
 */
export function parseCallStack(error: Error = new Error(), skipIndex = 1): IParsedCallStack {
  const skipIdx = skipIndex;
  const stackReg = /at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/;
  const stacklines = (error.stack || '').split('\n').slice(skipIdx);
  const lineMatch = stackReg.exec(stacklines[0]);

  if (lineMatch && lineMatch.length === 6) {
    return {
      functionName: lineMatch[1],
      filename: lineMatch[2],
      lineNumber: parseInt(lineMatch[3], 10),
      columnNumber: parseInt(lineMatch[4], 10),
      callStack: stacklines.join('\n'),
    };
  }
  return null;
}
