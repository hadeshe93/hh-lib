/**
 * 以文件形式下载二进制数据
 *
 * @export
 * @param {string} fileName
 * @param {Blob} blob
 */
export function downloadBlobAsFile(fileName: string, blob: Blob, revokeTimeout = 300) {
  const href = URL.createObjectURL(blob);
  const domTagA = document.createElement('a');
  domTagA.download = `${fileName}`;
  domTagA.href = href;
  domTagA.click();
  setTimeout(() => {
    URL.revokeObjectURL(href);
  }, revokeTimeout);
}
