import { Vector2 } from '../physics/vector2.js';

/**
 * Overlay label renderer for showing numerical values alongside vectors.
 */
export const LabelRenderer = {
  renderLabels(ctx, camera, particles, transformedStates, vectorOptions) {
    if (!vectorOptions.showLabels) return;

    ctx.save();
    ctx.font = '10px Fira Code, monospace';

    particles.forEach(p => {
      const state = transformedStates.get(p.id);
      if (!state) return;

      const pScreen = camera.worldToScreen(state.position);

      // Speed overlay text
      if (vectorOptions.showVel && state.speed > 0.01) {
        ctx.fillStyle = '#38bdf8';
        const vText = `v=${state.speed.toFixed(1)}m/s`;
        ctx.fillText(vText, pScreen.x + 12, pScreen.y - 4);
      }
    });

    // Relative values overlay text
    if (vectorOptions.showRelVel && particles.length >= 2) {
      const pA = particles[0];
      const pB = particles[1];
      const stateA = transformedStates.get(pA.id);
      const stateB = transformedStates.get(pB.id);

      if (stateA && stateB) {
        const vRel = stateB.velocity.sub(stateA.velocity);
        const screenB = camera.worldToScreen(stateB.position);

        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`v_BA=${vRel.magnitude().toFixed(2)}m/s`, screenB.x + 14, screenB.y + 12);
      }
    }

    ctx.restore();
  }
};
