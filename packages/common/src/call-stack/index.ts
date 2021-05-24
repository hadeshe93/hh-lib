export interface IParsedCallStack {
  functionName: string;
  filename: string;
  lineNumber: number;
  columnNumber: number;
  callStack: string;
}

/**
 * 解析调用栈信息
 * @param error 错误对象
 * @param skipIndex 从第几行调用栈信息开始解析
 * @returns 
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
