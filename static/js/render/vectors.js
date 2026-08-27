import { Vector2 } from '../physics/vector2.js';

/**
 * Helper to draw custom arrowheads and vectors on canvas.
 */
export const VectorRenderer = {
  drawArrow(ctx, fromScreen, toScreen, color = '#38bdf8', lineWidth = 2, dash = []) {
    const headLength = 8;
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    if (length < 1e-3) return; // Skip tiny vectors

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    if (dash.length) ctx.setLineDash(dash);

    // Main line
    ctx.beginPath();
    ctx.moveTo(fromScreen.x, fromScreen.y);
    ctx.lineTo(toScreen.x, toScreen.y);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash for solid arrowhead

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toScreen.x, toScreen.y);
    ctx.lineTo(
      toScreen.x - headLength * Math.cos(angle - Math.PI / 6),
      toScreen.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toScreen.x - headLength * Math.cos(angle + Math.PI / 6),
      toScreen.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  renderVectors(ctx, camera, particles, transformedStates, vectorOptions) {
    const scaleVel = 1.5; // Scale factor for velocity vector visualization (1 m/s = 1.5 m on canvas)
    const scaleAcc = 2.0; // Scale factor for acceleration vector visualization

    ctx.save();

    particles.forEach(p => {
      const state = transformedStates.get(p.id);
      if (!state) return;

      const pScreen = camera.worldToScreen(state.position);

      // 1. Position Vector (from Origin to Particle)
      if (vectorOptions.showPos) {
        const originScreen = camera.worldToScreen(new Vector2(0, 0));
        VectorRenderer.drawArrow(ctx, originScreen, pScreen, '#a855f7', 1.5, [4, 4]);
      }

      // 2. Velocity Vector
      if (vectorOptions.showVel && state.velocity.magnitudeSquared() > 1e-4) {
        const vEndWorld = state.position.add(state.velocity.scale(scaleVel));
        const vEndScreen = camera.worldToScreen(vEndWorld);
        VectorRenderer.drawArrow(ctx, pScreen, vEndScreen, '#38bdf8', 2);

        // Velocity Components (vx, vy)
        if (vectorOptions.showComponents) {
          const vxEndWorld = state.position.add(new Vector2(state.velocity.x * scaleVel, 0));
          const vxEndScreen = camera.worldToScreen(vxEndWorld);

          // Component X
          VectorRenderer.drawArrow(ctx, pScreen, vxEndScreen, '#0ea5e9', 1.5, [2, 2]);

          // Component Y (from end of Vx to total V)
          VectorRenderer.drawArrow(ctx, vxEndScreen, vEndScreen, '#0284c7', 1.5, [2, 2]);
        }
      }

      // 3. Acceleration Vector
      if (vectorOptions.showAcc && state.acceleration.magnitudeSquared() > 1e-4) {
        const aEndWorld = state.position.add(state.acceleration.scale(scaleAcc));
        const aEndScreen = camera.worldToScreen(aEndWorld);
        VectorRenderer.drawArrow(ctx, pScreen, aEndScreen, '#f59e0b', 2);
      }
    });

    // 4. Relative Vectors between two particles
    if (particles.length >= 2) {
      const pA = particles[0];
      const pB = particles[1];
      const stateA = transformedStates.get(pA.id);
      const stateB = transformedStates.get(pB.id);

      if (stateA && stateB) {
        const screenA = camera.worldToScreen(stateA.position);
        const screenB = camera.worldToScreen(stateB.position);

        // Relative Position r_BA (Arrow from A to B)
        if (vectorOptions.showRelPos) {
          VectorRenderer.drawArrow(ctx, screenA, screenB, '#ec4899', 2, [3, 3]);
        }

        // Relative Velocity v_BA (Rendered at B)
        if (vectorOptions.showRelVel) {
          const vRel = stateB.velocity.sub(stateA.velocity);
          if (vRel.magnitudeSquared() > 1e-4) {
            const vRelEndWorld = stateB.position.add(vRel.scale(scaleVel));
            const vRelEndScreen = camera.worldToScreen(vRelEndWorld);
            VectorRenderer.drawArrow(ctx, screenB, vRelEndScreen, '#f43f5e', 2.5);
          }
        }

        // Relative Acceleration a_BA (Rendered at B)
        if (vectorOptions.showRelAcc) {
          const aRel = stateB.acceleration.sub(stateA.acceleration);
          if (aRel.magnitudeSquared() > 1e-4) {
            const aRelEndWorld = stateB.position.add(aRel.scale(scaleAcc));
            const aRelEndScreen = camera.worldToScreen(aRelEndWorld);
            VectorRenderer.drawArrow(ctx, screenB, aRelEndScreen, '#d97706', 2.5);
          }
        }
      }
    }

    ctx.restore();
  }
};
