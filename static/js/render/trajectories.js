import { Vector2 } from '../physics/vector2.js';
import { Kinematics } from '../physics/kinematics.js';
import { RelativeMotion } from '../physics/relativeMotion.js';

/**
 * Renderer for particle trajectory paths in ground and relative frames.
 */
export const TrajectoryRenderer = {
  render(ctx, camera, particles, refParticleId, gravityVector, maxTime = 10) {
    ctx.save();

    const dt = 0.05; // Sample step for trajectory curve

    particles.forEach(p => {
      ctx.beginPath();
      ctx.strokeStyle = p.color || '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      let isFirst = true;

      for (let t = 0; t <= maxTime; t += dt) {
        const frameState = RelativeMotion.transformToFrame(particles, refParticleId, gravityVector, t);
        const state = frameState.states.get(p.id);
        if (!state) continue;

        const screenPos = camera.worldToScreen(state.position);

        if (isFirst) {
          ctx.moveTo(screenPos.x, screenPos.y);
          isFirst = false;
        } else {
          ctx.lineTo(screenPos.x, screenPos.y);
        }
      }

      ctx.stroke();
    });

    ctx.restore();
  }
};
