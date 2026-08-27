import { Camera } from './camera.js';
import { GridRenderer } from './grid.js';

/**
 * Canvas Manager managing main animation loop, context, resizing, and rendering pass delegation.
 */
export class CanvasManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.camera = new Camera(this.canvas);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas.parentElement);
    this.handleResize();
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBackground() {
    this.clear();
    GridRenderer.render(this.ctx, this.camera);
  }
}
