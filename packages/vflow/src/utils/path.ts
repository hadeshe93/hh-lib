import path from 'path';

import { ViceUtilsPathCtx } from '../types/utils';

export class ViceUtilsPath {
  private ctx: ViceUtilsPathCtx = {
    src: '',
    dest: '',
  };

  constructor(ctx: ViceUtilsPathCtx) {
    this.reinit(ctx);
  }

  reinit(ctx: ViceUtilsPathCtx) {
    this.ctx = ctx;
  }

  getDestinationRoot() {
    return this.ctx.dest;
  }

  getDestinationPath(relativePath: string) {
    return path.resolve(this.ctx.dest, relativePath);
  }

  getSourceRoot() {
    return this.ctx.src;
  }

  getSourcePath(relativePath: string) {
    return path.resolve(this.ctx.src, relativePath);
  }
}
