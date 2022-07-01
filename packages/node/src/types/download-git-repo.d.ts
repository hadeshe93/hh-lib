declare module 'download-git-repo' {
  export interface DownloadOpts {
    clone?: boolean;
    checkout?: string;
    shallow?: boolean;
  }
  export interface DownloadCallback {
    (param: undefined | Error): void;
  }
  export default function download(repo: string, dest: string, opts?: DownloadOpts, fn?: DownloadCallback): void;
}
