import { Particle } from '../physics/particle.js';
import { Units } from '../physics/units.js';

/**
 * Inspector UI controller for editing particles and environment settings.
 * Targeted DOM updates prevent scroll jumps, loss of focus, or caret jumps while typing.
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

    // Map storing active particle card DOM elements keyed by particle ID
    this.cardMap = new Map();

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
    // Update ref frame options without destroying active selection unless needed
    const existingVal = this.refFrameSelect.value;
    this.refFrameSelect.innerHTML = '<option value="ground">Ground Frame (S)</option>';
    particles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} Frame (S')`;
      if (p.id === currentRefId) opt.selected = true;
      this.refFrameSelect.appendChild(opt);
    });
    if (this.refFrameSelect.value !== currentRefId) {
      this.refFrameSelect.value = currentRefId;
    }
  }

  renderParticleCards(particles, selectedId, refId) {
    this.particleCountEl.textContent = particles.length;

    // Track active particle IDs to prune deleted ones
    const activeIds = new Set(particles.map(p => p.id));

    // Remove DOM nodes for deleted particles
    for (const [id, cardEl] of this.cardMap.entries()) {
      if (!activeIds.has(id)) {
        cardEl.remove();
        this.cardMap.delete(id);
      }
    }

    particles.forEach((p, idx) => {
      let card = this.cardMap.get(p.id);

      if (!card) {
        // Create card element once per particle
        card = this.createParticleCard(p, particles.length);
        this.cardMap.set(p.id, card);
        this.particleListContainer.appendChild(card);
      } else {
        // Targeted update of class list or calculated readouts without re-creating DOM inputs
        card.className = `particle-card ${p.id === refId ? 'active-ref' : ''}`;
        this.updateCardDeleteButtonState(card, particles.length);
      }
    });
  }

  updateCardDeleteButtonState(card, totalParticles) {
    const btnDelete = card.querySelector('.btn-delete');
    if (btnDelete) {
      btnDelete.style.display = totalParticles > 1 ? 'inline-flex' : 'none';
    }
  }

  createParticleCard(p, totalParticles) {
    const card = document.createElement('div');
    card.className = `particle-card ${p.id === this.app.refParticleId ? 'active-ref' : ''}`;
    card.setAttribute('data-particle-id', p.id);

    card.innerHTML = `
      <div class="particle-card-header">
        <div class="particle-title-wrapper">
          <button class="btn-toggle-expand" title="Expand/Collapse">▼</button>
          <span class="particle-color-indicator" style="background-color: ${p.color}"></span>
          <input type="text" class="particle-name-input" value="${p.name}">
        </div>
        <div class="particle-actions">
          <button class="btn-icon btn-sm btn-delete" title="Delete" style="${totalParticles > 1 ? '' : 'display:none;'}">✕</button>
        </div>
      </div>

      <div class="particle-card-body">
        <div class="accordion-section">
          <div class="section-label">POSITION</div>
          <div class="particle-grid">
            <div class="form-group">
              <label>Initial X (m):</label>
              <input type="number" class="p-x0" value="${p.r0.x}" step="1">
            </div>
            <div class="form-group">
              <label>Initial Y (m):</label>
              <input type="number" class="p-y0" value="${p.r0.y}" step="1">
            </div>
          </div>
        </div>

        <div class="accordion-section">
          <div class="section-label">VELOCITY</div>
          <div class="particle-grid">
            <div class="form-group">
              <label>Speed (m/s):</label>
              <input type="number" class="p-speed" value="${p.speed.toFixed(2)}" step="0.5" min="0">
            </div>
            <div class="form-group">
              <label>Angle (°):</label>
              <input type="number" class="p-angle" value="${p.angleDeg.toFixed(1)}" step="5">
            </div>
          </div>
        </div>

        <div class="accordion-section">
          <div class="section-label">COMPONENTS (CALCULATED)</div>
          <div class="particle-grid">
            <div class="form-group">
              <label>vx (m/s):</label>
              <input type="number" class="p-vx" value="${p.v0.x.toFixed(2)}" step="0.5">
            </div>
            <div class="form-group">
              <label>vy (m/s):</label>
              <input type="number" class="p-vy" value="${p.v0.y.toFixed(2)}" step="0.5">
            </div>
          </div>
        </div>

        <div class="accordion-section">
          <div class="section-label">ACCELERATION</div>
          <div class="particle-grid">
            <div class="form-group">
              <label>ax (m/s²):</label>
              <input type="number" class="p-ax" value="${p.a0.x}" step="0.5">
            </div>
            <div class="form-group">
              <label>ay (m/s²):</label>
              <input type="number" class="p-ay" value="${p.a0.y}" step="0.5">
            </div>
          </div>
        </div>
      </div>
    `;

    // Elements
    const btnToggle = card.querySelector('.btn-toggle-expand');
    const cardBody = card.querySelector('.particle-card-body');
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

    // Accordion Expand/Collapse
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCollapsed = cardBody.classList.toggle('collapsed');
      btnToggle.textContent = isCollapsed ? '▶' : '▼';
    });

    nameInput.addEventListener('input', (e) => {
      p.name = e.target.value;
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    });

    x0Input.addEventListener('input', (e) => {
      p.r0.x = parseFloat(e.target.value) || 0;
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    });

    y0Input.addEventListener('input', (e) => {
      p.r0.y = parseFloat(e.target.value) || 0;
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    });

    // Bi-directional synchronization: Speed & Angle -> Vx & Vy
    const syncFromPolar = () => {
      const speed = parseFloat(speedInput.value) || 0;
      const angle = parseFloat(angleInput.value) || 0;
      p.setSpeedAndAngle(speed, angle);
      vxInput.value = p.v0.x.toFixed(2);
      vyInput.value = p.v0.y.toFixed(2);
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    };

    // Bi-directional synchronization: Vx & Vy -> Speed & Angle
    const syncFromCartesian = () => {
      const vx = parseFloat(vxInput.value) || 0;
      const vy = parseFloat(vyInput.value) || 0;
      p.setVxVy(vx, vy);
      speedInput.value = p.speed.toFixed(2);
      angleInput.value = p.angleDeg.toFixed(1);
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    };

    speedInput.addEventListener('input', syncFromPolar);
    angleInput.addEventListener('input', syncFromPolar);
    vxInput.addEventListener('input', syncFromCartesian);
    vyInput.addEventListener('input', syncFromCartesian);

    axInput.addEventListener('input', (e) => {
      p.a0.x = parseFloat(e.target.value) || 0;
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    });

    ayInput.addEventListener('input', (e) => {
      p.a0.y = parseFloat(e.target.value) || 0;
      this.app.onParticleUpdated({ redrawInspectorCards: false });
    });

    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        this.app.deleteParticle(p.id);
      });
    }

    return card;
  }
}
