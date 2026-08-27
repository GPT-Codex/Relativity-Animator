import { Vector2 } from '../physics/vector2.js';

/**
 * Grid renderer for drawing coordinate axes, metric grid lines, tick labels, origin, and scale bar.
 */
export const GridRenderer = {
  render(ctx, camera) {
    const width = camera.canvas.width;
    const height = camera.canvas.height;

    // Calculate grid spacing in meters based on current zoom level
    const targetCellPixels = 80;
    const rawMetersPerCell = targetCellPixels / camera.pixelsPerMeter;

    // Nice round numbers: 1, 2, 5, 10, 20, 50, 100, etc.
    const exponent = Math.floor(Math.log10(rawMetersPerCell));
    const fraction = rawMetersPerCell / Math.pow(10, exponent);
    let niceMultiplier = 1;
    if (fraction >= 5) niceMultiplier = 5;
    else if (fraction >= 2) niceMultiplier = 2;

    const gridSpacingMeters = niceMultiplier * Math.pow(10, exponent);

    // Get visible world bounds
    const topLeftWorld = camera.screenToWorld(new Vector2(0, 0));
    const bottomRightWorld = camera.screenToWorld(new Vector2(width, height));

    const startX = Math.floor(topLeftWorld.x / gridSpacingMeters) * gridSpacingMeters;
    const endX = Math.ceil(bottomRightWorld.x / gridSpacingMeters) * gridSpacingMeters;

    const endY = Math.ceil(topLeftWorld.y / gridSpacingMeters) * gridSpacingMeters;
    const startY = Math.floor(bottomRightWorld.y / gridSpacingMeters) * gridSpacingMeters;

    ctx.save();

    // 1. Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Fira Code, monospace';

    // Vertical grid lines (X)
    for (let x = startX; x <= endX; x += gridSpacingMeters) {
      const screenPos = camera.worldToScreen(new Vector2(x, 0));
      ctx.beginPath();
      ctx.moveTo(screenPos.x, 0);
      ctx.lineTo(screenPos.x, height);
      ctx.stroke();

      // Tick label
      if (Math.abs(x) > 1e-5) {
        ctx.fillText(`${x.toFixed(x % 1 === 0 ? 0 : 1)}m`, screenPos.x + 3, camera.worldToScreen(new Vector2(0, 0)).y + 12);
      }
    }

    // Horizontal grid lines (Y)
    for (let y = startY; y <= endY; y += gridSpacingMeters) {
      const screenPos = camera.worldToScreen(new Vector2(0, y));
      ctx.beginPath();
      ctx.moveTo(0, screenPos.y);
      ctx.lineTo(width, screenPos.y);
      ctx.stroke();

      // Tick label
      if (Math.abs(y) > 1e-5) {
        ctx.fillText(`${y.toFixed(y % 1 === 0 ? 0 : 1)}m`, camera.worldToScreen(new Vector2(0, 0)).x + 3, screenPos.y - 3);
      }
    }

    // 2. Draw Main Axes (X=0, Y=0)
    const originScreen = camera.worldToScreen(new Vector2(0, 0));

    // X Axis
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originScreen.y);
    ctx.lineTo(width, originScreen.y);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originScreen.x, 0);
    ctx.lineTo(originScreen.x, height);
    ctx.stroke();

    // Origin Indicator
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(originScreen.x, originScreen.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('(0,0)', originScreen.x + 6, originScreen.y - 6);

    // 3. Draw Metric Scale Bar in bottom-left corner
    const scaleBarMeters = gridSpacingMeters;
    const scaleBarPixels = scaleBarMeters * camera.pixelsPerMeter;
    const barX = 20;
    const barY = height - 20;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + scaleBarPixels, barY);
    ctx.moveTo(barX, barY - 4);
    ctx.lineTo(barX, barY + 4);
    ctx.moveTo(barX + scaleBarPixels, barY - 4);
    ctx.lineTo(barX + scaleBarPixels, barY + 4);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${scaleBarMeters} m`, barX + scaleBarPixels / 2 - 10, barY - 8);

    ctx.restore();
  }
};
