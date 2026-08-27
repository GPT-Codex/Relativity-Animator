import { Vector2 } from '../physics/vector2.js';
import { RelativeMotion } from '../physics/relativeMotion.js';

/**
 * Interactive canvas graphs for x(t), y(t), vx(t), vy(t), speed(t), and separation distance d(t).
 * Synchronized with simulation time cursor. Scrubbing graph updates simulation time.
 */
export class GraphsController {
  constructor(canvasElement, app) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.app = app;

    this.selectedQuantity = 'distance'; // Default graph quantity
    this.setupListeners();
  }

  setupListeners() {
    const graphSelect = document.getElementById('graphSelect');
    if (graphSelect) {
      graphSelect.addEventListener('change', (e) => {
        this.selectedQuantity = e.target.value;
        this.render();
      });
    }

    // Graph scrubbing on click/drag
    let isScrubbing = false;

    const handleScrub = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const paddingLeft = 40;
      const paddingRight = 20;
      const graphWidth = this.canvas.width - paddingLeft - paddingRight;

      if (graphWidth > 0) {
        const normX = Math.max(0, Math.min(1, (clickX - paddingLeft) / graphWidth));
        const maxTime = this.app.controls ? this.app.controls.maxTime : 10;
        const targetTime = normX * maxTime;
        this.app.controls.setTime(targetTime);
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      handleScrub(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) handleScrub(e);
    });

    window.addEventListener('mouseup', () => {
      isScrubbing = false;
    });
  }

  render() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    if (graphWidth <= 0 || graphHeight <= 0) return;

    const maxTime = this.app.controls ? this.app.controls.maxTime : 10;
    const currentTime = this.app.controls ? this.app.controls.currentTime : 0;
    const particles = this.app.particles || [];
    const gravity = this.app.getGravityVector();
    const refFrameId = this.app.refParticleId;

    // Sample simulation data from t = 0 to maxTime
    const dt = 0.1;
    const samples = [];
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let t = 0; t <= maxTime; t += dt) {
      const frameState = RelativeMotion.transformToFrame(particles, refFrameId, gravity, t);
      let val = 0;

      if (this.selectedQuantity === 'distance' && particles.length >= 2) {
        const stateA = frameState.states.get(particles[0].id);
        const stateB = frameState.states.get(particles[1].id);
        if (stateA && stateB) val = stateB.position.sub(stateA.position).magnitude();
      } else if (particles.length > 0) {
        const targetP = particles[particles.length > 1 && refFrameId !== particles[0].id ? 0 : 0]; // Primary target particle
        const state = frameState.states.get(targetP.id);
        if (state) {
          switch (this.selectedQuantity) {
            case 'x': val = state.position.x; break;
            case 'y': val = state.position.y; break;
            case 'vx': val = state.velocity.x; break;
            case 'vy': val = state.velocity.y; break;
            case 'speed': val = state.speed; break;
            case 'rel_x':
              if (particles.length >= 2) {
                const sA = frameState.states.get(particles[0].id);
                const sB = frameState.states.get(particles[1].id);
                val = sB.position.x - sA.position.x;
              }
              break;
            case 'rel_y':
              if (particles.length >= 2) {
                const sA = frameState.states.get(particles[0].id);
                const sB = frameState.states.get(particles[1].id);
                val = sB.position.y - sA.position.y;
              }
              break;
            case 'rel_v':
              if (particles.length >= 2) {
                const sA = frameState.states.get(particles[0].id);
                const sB = frameState.states.get(particles[1].id);
                val = sB.velocity.sub(sA.velocity).magnitude();
              }
              break;
          }
        }
      }

      samples.push({ t, val });
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }

    if (minVal === maxVal) {
      minVal -= 1;
      maxVal += 1;
    }

    // Add padding to Y scale
    const yRange = maxVal - minVal;
    minVal -= yRange * 0.1;
    maxVal += yRange * 0.1;

    // Helper functions for graph coordinates
    const tToX = (t) => paddingLeft + (t / maxTime) * graphWidth;
    const valToY = (val) => paddingTop + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;

    ctx.save();

    // 1. Draw Axes & Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Fira Code, monospace';

    // X axis line (t)
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + graphHeight);
    ctx.lineTo(paddingLeft + graphWidth, paddingTop + graphHeight);
    ctx.stroke();

    // Y axis line (val)
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + graphHeight);
    ctx.stroke();

    // Y ticks and labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const yVal = minVal + (i / yTicks) * (maxVal - minVal);
      const yPos = valToY(yVal);
      ctx.fillText(yVal.toFixed(1), 5, yPos + 3);

      ctx.beginPath();
      ctx.strokeStyle = '#1e293b';
      ctx.moveTo(paddingLeft, yPos);
      ctx.lineTo(paddingLeft + graphWidth, yPos);
      ctx.stroke();
    }

    // X ticks (Time)
    for (let t = 0; t <= maxTime; t += Math.max(1, Math.floor(maxTime / 5))) {
      const xPos = tToX(t);
      ctx.fillText(`${t}s`, xPos - 6, height - 10);
    }

    // 2. Draw Data Plot Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((sample, i) => {
      const x = tToX(sample.t);
      const y = valToY(sample.val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Synchronized Time Cursor Line
    const cursorX = tToX(currentTime);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cursorX, paddingTop);
    ctx.lineTo(cursorX, paddingTop + graphHeight);
    ctx.stroke();

    ctx.restore();
  }
}
