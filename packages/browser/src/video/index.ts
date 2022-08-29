/**
 * 获取视频帧
 *
 * @export
 * @param {HTMLVideoElement} videoElem
 * @returns 帧的 bloburl
 */
export function getFrameFromVideo(videoElem: HTMLVideoElement): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.height = videoElem.videoHeight;
    canvas.width = videoElem.videoWidth;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      resolve(blob && window.URL.createObjectURL(blob));
    }, 'image/jpeg');
  });
}

/**
 * 获取视频中的所有帧，可指定帧数
 *
 * @export
 * @param {string} videoSrc
 * @param {number} [frameCount=5]
 * @returns 帧 bloburl 数组
 */
export function getAllVideoFrames(videoSrc: string, oriFrameCount?: number) {
  return new Promise((resolve) => {
    const videoElem = document.createElement('video');
    let duration;
    const frameTimelines = [];
    const frames = [];
    videoElem.addEventListener('loadedmetadata', () => {
      duration = videoElem.duration;
      const frameCount = oriFrameCount ?? Math.floor(duration);
      for (let i = 0; i < frameCount; i++) {
        frameTimelines.push(Math.floor((duration / frameCount) * (i + 1)));
      }
    });
    videoElem.addEventListener('loadeddata', () => {
      videoElem.currentTime = frameTimelines.shift() || 0;
    });
    videoElem.addEventListener('seeked', async () => {
      frames.push(await getFrameFromVideo(videoElem));
      if (frameTimelines.length === 0) {
        resolve(frames);
      } else {
        videoElem.currentTime = frameTimelines.shift() || 0;
      }
    });
    videoElem.src = videoSrc;
  });
}
