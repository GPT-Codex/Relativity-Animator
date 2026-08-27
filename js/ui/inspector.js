import { Particle } from '../physics/particle.js';
import { Units } from '../physics/units.js';

/**
 * Inspector UI controller for editing particles and environment settings.
 * Synchronizes speed+angle <-> vx+vy bidirectionally.
 */
export class InspectorController {
  constructor(app) {
    this.app = app;
    this.particleListContainer = document.getElementById('particleList');
    this.particleCountEl = document.getElementById('particleCount');
    this.btnAddParticle = document.getElementById('btnAddParticle');
    this.refFrameSelect = document.getElementById('refFrameSelect');

    this.gravityInput = document.getElementById('gravityValue');
    this.gravityDirSelect = document.getElementById('gravityDir');
    this.gravityEnableCheck = document.getElementById('gravityEnable');

    this.setupListeners();
  }

  setupListeners() {
    this.btnAddParticle.addEventListener('click', () => {
      this.app.addParticle();
    });

    this.refFrameSelect.addEventListener('change', (e) => {
      this.app.setReferenceFrame(e.target.value);
    });

    const onEnvChange = () => {
      this.app.updateEnvironment({
        enabled: this.gravityEnableCheck.checked,
        value: parseFloat(this.gravityInput.value) || 0,
        direction: this.gravityDirSelect.value
      });
    };

    this.gravityInput.addEventListener('input', onEnvChange);
    this.gravityDirSelect.addEventListener('change', onEnvChange);
    this.gravityEnableCheck.addEventListener('change', onEnvChange);
  }

  updateRefFrameSelect(particles, currentRefId) {
    this.refFrameSelect.innerHTML = '<option value="ground">Ground Frame (S)</option>';
    particles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} Frame (S')`;
      if (p.id === currentRefId) opt.selected = true;
      this.refFrameSelect.appendChild(opt);
    });
  }

  renderParticleCards(particles, selectedId, refId) {
    this.particleCountEl.textContent = particles.length;
    this.particleListContainer.innerHTML = '';

    particles.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = `particle-card ${p.id === refId ? 'active-ref' : ''}`;

      card.innerHTML = `
        <div class="particle-card-header">
          <div class="particle-title">
            <span class="particle-color-indicator" style="background-color: ${p.color}"></span>
            <input type="text" class="particle-name-input" value="${p.name}" style="width: 90px; padding: 0.1rem 0.3rem;">
          </div>
          <div class="particle-actions">
            ${particles.length > 1 ? `<button class="btn-icon btn-sm btn-delete" title="Delete">✕</button>` : ''}
          </div>
        </div>

        <div class="particle-grid">
          <div class="form-group">
            <label>Initial X (m):</label>
            <input type="number" class="p-x0" value="${p.r0.x}" step="1">
          </div>
          <div class="form-group">
            <label>Initial Y (m):</label>
            <input type="number" class="p-y0" value="${p.r0.y}" step="1">
          </div>
          <div class="form-group">
            <label>Speed (m/s):</label>
            <input type="number" class="p-speed" value="${p.speed.toFixed(2)}" step="0.5" min="0">
          </div>
          <div class="form-group">
            <label>Angle (°):</label>
            <input type="number" class="p-angle" value="${p.angleDeg.toFixed(1)}" step="5">
          </div>
          <div class="form-group">
            <label>vx (m/s):</label>
            <input type="number" class="p-vx" value="${p.v0.x.toFixed(2)}" step="0.5">
          </div>
          <div class="form-group">
            <label>vy (m/s):</label>
            <input type="number" class="p-vy" value="${p.v0.y.toFixed(2)}" step="0.5">
          </div>
          <div class="form-group">
            <label>ax (m/s²):</label>
            <input type="number" class="p-ax" value="${p.a0.x}" step="0.5">
          </div>
          <div class="form-group">
            <label>ay (m/s²):</label>
            <input type="number" class="p-ay" value="${p.a0.y}" step="0.5">
          </div>
        </div>
      `;

      // Inputs
      const nameInput = card.querySelector('.particle-name-input');
      const x0Input = card.querySelector('.p-x0');
      const y0Input = card.querySelector('.p-y0');
      const speedInput = card.querySelector('.p-speed');
      const angleInput = card.querySelector('.p-angle');
      const vxInput = card.querySelector('.p-vx');
      const vyInput = card.querySelector('.p-vy');
      const axInput = card.querySelector('.p-ax');
      const ayInput = card.querySelector('.p-ay');
      const btnDelete = card.querySelector('.btn-delete');

      nameInput.addEventListener('change', (e) => {
        p.name = e.target.value;
        this.app.onParticleUpdated();
      });

      x0Input.addEventListener('input', (e) => {
        p.r0.x = parseFloat(e.target.value) || 0;
        this.app.onParticleUpdated();
      });

      y0Input.addEventListener('input', (e) => {
        p.r0.y = parseFloat(e.target.value) || 0;
        this.app.onParticleUpdated();
      });

      // Bi-directional synchronization: Speed & Angle -> Vx & Vy
      const syncFromPolar = () => {
        const speed = parseFloat(speedInput.value) || 0;
        const angle = parseFloat(angleInput.value) || 0;
        p.setSpeedAndAngle(speed, angle);
        vxInput.value = p.v0.x.toFixed(2);
        vyInput.value = p.v0.y.toFixed(2);
        this.app.onParticleUpdated();
      };

      // Bi-directional synchronization: Vx & Vy -> Speed & Angle
      const syncFromCartesian = () => {
        const vx = parseFloat(vxInput.value) || 0;
        const vy = parseFloat(vyInput.value) || 0;
        p.setVxVy(vx, vy);
        speedInput.value = p.speed.toFixed(2);
        angleInput.value = p.angleDeg.toFixed(1);
        this.app.onParticleUpdated();
      };

      speedInput.addEventListener('input', syncFromPolar);
      angleInput.addEventListener('input', syncFromPolar);
      vxInput.addEventListener('input', syncFromCartesian);
      vyInput.addEventListener('input', syncFromCartesian);

      axInput.addEventListener('input', (e) => {
        p.a0.x = parseFloat(e.target.value) || 0;
        this.app.onParticleUpdated();
      });

      ayInput.addEventListener('input', (e) => {
        p.a0.y = parseFloat(e.target.value) || 0;
        this.app.onParticleUpdated();
      });

      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          this.app.deleteParticle(p.id);
        });
      }

      this.particleListContainer.appendChild(card);
    });
  }
}
