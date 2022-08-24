import { exportDataBlob } from '@hadeshe93/lib-common';
import { downloadBlobAsFile } from '../download';

export function exportDataAsExcel(...args: Parameters<typeof exportDataBlob>) {
  const blob = exportDataBlob(...args);
  const title = args[2];
  downloadBlobAsFile(title, blob);
}
