import type { XLSX$Utils, WorkBook, WritingOptions, write } from 'xlsx';

export interface ExportExcelCol {
  // 列名称
  title: string;
  // 字段名称
  key: string;
  // 对原值进行处理后返回的函数
  renderFn?: (value: any, rowData: any) => string;
  [propKey: string]: any;
}

export interface CreateExportDataBlobOptions {
  xlsxUtils: XLSX$Utils;
  xlsxWrite: typeof write;
}
/**
 * 创建以 blob 二进制数据形式导出数据的函数
 *
 * @export
 * @param {Options} options
 * @returns {*}
 */
export function createExportDataBlob(options: CreateExportDataBlobOptions) {
  const { xlsxUtils, xlsxWrite } = options;
  const workbook2blob = createWorkbook2blob({ xlsxWrite });
  return function exportDataBlob(cols: ExportExcelCol[], data: any[], excelTitle: string): Blob {
    const workBook = xlsxUtils.book_new();
    const excelHeaders = cols.map((col) => col.title);
    const excelData: any[][] = data.map((rowData) =>
      cols.map((col) => {
        const value = rowData[col.key];
        if (typeof col.renderFn === 'function') {
          return col.renderFn(value, rowData);
        }
        return value;
      }),
    );
    excelData.unshift(excelHeaders);

    const sheet = xlsxUtils.aoa_to_sheet(excelData);
    xlsxUtils.book_append_sheet(workBook, sheet, excelTitle);
    const workbookBlob = workbook2blob(workBook);
    return workbookBlob;
  };
}

/**
 * 将 workbook 转换成 blob 对象
 *
 * @param {XLSX.WorkBook} workbook
 * @returns 二进制数据
 */
function createWorkbook2blob(options: Pick<CreateExportDataBlobOptions, 'xlsxWrite'>) {
  const { xlsxWrite } = options;
  return function workbook2blob(workbook: WorkBook): Blob {
    // 生成excel的配置项
    const options: WritingOptions = {
      // 要生成的文件类型
      bookType: 'xlsx',
      // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      bookSST: false,
      type: 'binary',
    };
    const workbookOut = xlsxWrite(workbook, options);

    return new Blob([string2ArrayBuffer(workbookOut)], {
      type: 'application/octet-stream',
    });
  };
}

/**
 * 将字符串转 ArrayBuffer
 *
 * @param {string} s 字符串
 * @returns ArrayBuffer 实例
 */
function string2ArrayBuffer(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}
