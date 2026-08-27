import { Vector2 } from '../physics/vector2.js';

/**
 * Camera class converting world coordinates (meters) to canvas screen coordinates (pixels).
 * Handles pan, zoom, scale, and auto-fit scene bounds.
 */
export class Camera {
  constructor(canvas) {
    this.canvas = canvas;

    // Camera state
    this.centerWorld = new Vector2(30, 15); // Default initial center in world coords
    this.pixelsPerMeter = 12;                // Initial scale: 12 px per meter
    this.minPixelsPerMeter = 1;
    this.maxPixelsPerMeter = 500;

    // Pan state
    this.isDragging = false;
    this.dragStartScreen = new Vector2(0, 0);
    this.dragStartCenter = new Vector2(0, 0);

    this.setupListeners();
  }

  setupListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.dragStartScreen = new Vector2(e.clientX, e.clientY);
        this.dragStartCenter = this.centerWorld.clone();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaScreen = new Vector2(e.clientX - this.dragStartScreen.x, e.clientY - this.dragStartScreen.y);
        // Canvas Y is inverted relative to world Y
        const deltaWorld = new Vector2(-deltaScreen.x / this.pixelsPerMeter, deltaScreen.y / this.pixelsPerMeter);
        this.centerWorld = this.dragStartCenter.add(deltaWorld);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.zoomAtScreenPos(e.offsetX, e.offsetY, zoomFactor);
    }, { passive: false });
  }

  zoomAtScreenPos(screenX, screenY, factor) {
    const worldBefore = this.screenToWorld(new Vector2(screenX, screenY));
    this.pixelsPerMeter = Math.max(this.minPixelsPerMeter, Math.min(this.maxPixelsPerMeter, this.pixelsPerMeter * factor));
    const worldAfter = this.screenToWorld(new Vector2(screenX, screenY));

    // Shift center to keep mouse position fixed in world space
    const shiftWorld = worldBefore.sub(worldAfter);
    this.centerWorld = this.centerWorld.add(shiftWorld);
  }

  worldToScreen(worldPos) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const screenX = width / 2 + (worldPos.x - this.centerWorld.x) * this.pixelsPerMeter;
    // World Y is upwards (+Y up), screen Y is downwards (+Y down)
    const screenY = height / 2 - (worldPos.y - this.centerWorld.y) * this.pixelsPerMeter;

    return new Vector2(screenX, screenY);
  }

  screenToWorld(screenPos) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const worldX = this.centerWorld.x + (screenPos.x - width / 2) / this.pixelsPerMeter;
    const worldY = this.centerWorld.y - (screenPos.y - height / 2) / this.pixelsPerMeter;

    return new Vector2(worldX, worldY);
  }

  zoomIn() {
    this.pixelsPerMeter = Math.min(this.maxPixelsPerMeter, this.pixelsPerMeter * 1.25);
  }

  zoomOut() {
    this.pixelsPerMeter = Math.max(this.minPixelsPerMeter, this.pixelsPerMeter / 1.25);
  }

  reset() {
    this.centerWorld = new Vector2(30, 15);
    this.pixelsPerMeter = 12;
  }

  fitBounds(minX, maxX, minY, maxY) {
    const padding = 60; // Pixels padding
    const worldWidth = Math.max(10, maxX - minX);
    const worldHeight = Math.max(10, maxY - minY);

    const availableWidth = Math.max(100, this.canvas.width - 2 * padding);
    const availableHeight = Math.max(100, this.canvas.height - 2 * padding);

    const scaleX = availableWidth / worldWidth;
    const scaleY = availableHeight / worldHeight;

    this.pixelsPerMeter = Math.max(this.minPixelsPerMeter, Math.min(this.maxPixelsPerMeter, Math.min(scaleX, scaleY)));
    this.centerWorld = new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
  }
}
