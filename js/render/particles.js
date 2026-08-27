import { Vector2 } from '../physics/vector2.js';

/**
 * Particle Renderer for drawing particles in ground or relative frames.
 */
export const ParticleRenderer = {
  render(ctx, camera, particles, transformedStates, selectedParticleId, refParticleId) {
    ctx.save();

    particles.forEach(p => {
      const state = transformedStates.get(p.id);
      if (!state) return;

      const screenPos = camera.worldToScreen(state.position);
      const isSelected = (p.id === selectedParticleId);
      const isRef = (p.id === refParticleId);

      // 1. Draw Particle Glow / Highlight if reference or selected
      if (isRef) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 18, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 18, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isSelected) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 16, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 2. Draw Particle Body
      ctx.fillStyle = p.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Draw Particle Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, screenPos.x, screenPos.y - 12);

      // Position readout text under particle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Fira Code, monospace';
      ctx.fillText(
        `(${state.position.x.toFixed(1)}, ${state.position.y.toFixed(1)})m`,
        screenPos.x,
        screenPos.y + 20
      );
    });

    ctx.restore();
  }
};
