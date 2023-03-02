const IMAGE_TYPE_MAP = {
  JPEG: 'jpeg',
  PNG: 'png',
  GIF: 'gif',
  BMP: 'bmp',
  UNKNOWN: 'unknown',
};

const IMAGE_MAGIC_NUMBER_MAP = {
  [IMAGE_TYPE_MAP.JPEG]: [0xff, 0xd8, 0xff],
  [IMAGE_TYPE_MAP.PNG]: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  [IMAGE_TYPE_MAP.GIF]: [0x47, 0x49, 0x46, 0x38],
  [IMAGE_TYPE_MAP.BMP]: [0x42, 0x4d],
};

interface OptionsForCheckImageType {
  extraImageMagicNumberMap?: {
    [key: string]: number[];
  };
}

/**
 * 根据文件头检查图片类型
 * - 因为单纯根据 MIME 或者文件后缀是无法准确判断的
 *
 * @export
 * @param {*} file
 * @param {OptionsForCheckImageType} [options]
 * @returns {*}
 */
export async function checkImageType(file: any, options?: OptionsForCheckImageType) {
  let fileArrayBuffer: Uint8Array;
  if (typeof window === undefined) {
    fileArrayBuffer = await getFileArrayBufferInNode(file);
  } else {
    fileArrayBuffer = await getFileArrayBufferInBrowser(file);
  }
  if (!fileArrayBuffer) return IMAGE_TYPE_MAP.UNKNOWN;
  const lastImageMagicNumberMap = {
    ...IMAGE_MAGIC_NUMBER_MAP,
    ...(options?.extraImageMagicNumberMap || {}),
  };
  const typeNameList = Object.keys(lastImageMagicNumberMap);
  for (let i = 0; i < typeNameList.length; i++) {
    const typeName = typeNameList[i];
    const headers = lastImageMagicNumberMap[typeName];
    // 如果文件头能完全匹配上，则表示的确是对应的类型
    const isMatched = headers.every((header, index) => header === fileArrayBuffer[index]);
    if (isMatched) return typeName;
  }
  // 否则为位置类型
  return IMAGE_TYPE_MAP.UNKNOWN;
}

/**
 * Node 端读取文件为 Uint8Array 格式
 *
 * @param {(string | ArrayBuffer)} file
 * @returns {*}
 */
async function getFileArrayBufferInNode(file: string | ArrayBuffer) {
  let fileArrayBuffer: Uint8Array;
  if (typeof file === 'string') {
    const fs = require('fs');
    // 直接以 Buffer 形式读取
    fileArrayBuffer = new Uint8Array(fs.readFileSync(file));
  } else if (file instanceof Uint8Array) {
    fileArrayBuffer = file;
  } else if (file instanceof ArrayBuffer) {
    fileArrayBuffer = new Uint8Array(file);
  }
  return fileArrayBuffer;
}

/**
 * 浏览器端读取文件为 Uint8Array 格式
 *
 * @param {Blob} file
 * @returns {*}
 */
async function getFileArrayBufferInBrowser(file: Blob) {
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    const arrBuffer = await file.arrayBuffer();
    return new Uint8Array(arrBuffer);
  }
  return undefined;
}
