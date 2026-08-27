import { Vector2 } from './physics/vector2.js';
import { Particle } from './physics/particle.js';
import { Kinematics } from './physics/kinematics.js';
import { RelativeMotion } from './physics/relativeMotion.js';
import { ClosestApproach } from './physics/closestApproach.js';
import { Collision } from './physics/collision.js';

import { CanvasManager } from './render/canvas.js';
import { ParticleRenderer } from './render/particles.js';
import { VectorRenderer } from './render/vectors.js';
import { TrajectoryRenderer } from './render/trajectories.js';
import { LabelRenderer } from './render/labels.js';

import { ControlsController } from './ui/controls.js';
import { InspectorController } from './ui/inspector.js';
import { GraphsController } from './ui/graphs.js';
import { PanelsController } from './ui/panels.js';

import { Presets } from './presets/presetManager.js';
import { CustomPresetManager } from './presets/customPresets.js';
import { ExplanationGenerator } from './explain/generator.js';

class RelativeMotionApp {
  constructor() {
    this.particles = [];
    this.refParticleId = 'ground';
    this.selectedParticleId = null;

    this.gravityConfig = {
      enabled: true,
      value: 9.8,
      direction: 'down'
    };

    this.vectorOptions = {
      showPos: true,
      showVel: true,
      showAcc: true,
      showComponents: true,
      showRelVel: true,
      showRelAcc: true,
      showRelPos: true,
      showTrajectory: true,
      showLabels: true
    };

    this.customPresetManager = new CustomPresetManager(this);

    this.initCanvas();
    this.initControllers();
    this.bindHeaderActions();
    this.initCustomPresetModal();

    this.refreshPresetDropdown();

    // Load default JEE Example
    this.loadPreset('jee-example');

    // Start render loop
    requestAnimationFrame((ts) => this.loop(ts));
  }

  initCanvas() {
    const simCanvas = document.getElementById('simCanvas');
    const graphCanvas = document.getElementById('graphCanvas');

    this.canvasManager = new CanvasManager(simCanvas);
    this.graphs = new GraphsController(graphCanvas, this);
  }

  initControllers() {
    this.controls = new ControlsController(this);
    this.inspector = new InspectorController(this);
    this.panels = new PanelsController(this);

    this.bindVectorToggles();
  }

  refreshPresetDropdown() {
    const optgroupCustom = document.getElementById('presetOptgroupCustom');
    if (!optgroupCustom) return;

    optgroupCustom.innerHTML = '';
    const customPresets = this.customPresetManager.getAllCustomPresets();

    Object.values(customPresets).forEach(cp => {
      const opt = document.createElement('option');
      opt.value = `custom_${cp.id}`;
      opt.textContent = cp.name;
      optgroupCustom.appendChild(opt);
    });
  }

  bindHeaderActions() {
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val.startsWith('custom_')) {
          const customId = val.replace(/^custom_/, '');
          this.loadCustomPreset(customId);
        } else {
          this.loadPreset(val);
        }
      });
    }

    // Custom Preset Buttons
    const btnSaveCustomPreset = document.getElementById('btnSaveCustomPreset');
    const btnManageCustomPresets = document.getElementById('btnManageCustomPresets');

    if (btnSaveCustomPreset) {
      btnSaveCustomPreset.addEventListener('click', () => {
        this.openPresetModal('save');
      });
    }

    if (btnManageCustomPresets) {
      btnManageCustomPresets.addEventListener('click', () => {
        this.openPresetModal('manage');
      });
    }

    // Signature Feature: "Make Relative Motion Obvious"
    const btnObvious = document.getElementById('btnObvious');
    if (btnObvious) {
      btnObvious.addEventListener('click', () => {
        this.makeRelativeMotionObvious();
      });
    }

    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnFitView = document.getElementById('btnFitView');
    const btnResetCam = document.getElementById('btnResetCam');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.canvasManager.camera.zoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.canvasManager.camera.zoomOut());
    if (btnFitView) btnFitView.addEventListener('click', () => this.fitScene());
    if (btnResetCam) btnResetCam.addEventListener('click', () => this.canvasManager.camera.reset());

    // Coordinate readout mousemove handler
    const simCanvas = document.getElementById('simCanvas');
    const coordReadout = document.getElementById('coordReadout');
    simCanvas.addEventListener('mousemove', (e) => {
      const rect = simCanvas.getBoundingClientRect();
      const screenPos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      const worldPos = this.canvasManager.camera.screenToWorld(screenPos);
      if (coordReadout) {
        coordReadout.textContent = `x: ${worldPos.x.toFixed(2)} m, y: ${worldPos.y.toFixed(2)} m`;
      }
    });
  }

  initCustomPresetModal() {
    const modal = document.getElementById('modalPreset');
    const btnClose = document.getElementById('btnCloseModal');
    const btnSave = document.getElementById('btnSavePresetModal');
    const btnDelete = document.getElementById('btnDeletePresetModal');
    const btnExport = document.getElementById('btnExportPresetModal');
    const btnImport = document.getElementById('btnImportPresetModal');
    const fileImport = document.getElementById('filePresetImport');

    const nameInput = document.getElementById('presetNameInput');
    const descInput = document.getElementById('presetDescInput');

    if (btnClose) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const name = nameInput.value.trim() || 'My Custom Simulation';
        const desc = descInput.value.trim();
        const config = this.exportConfig();
        const saved = this.customPresetManager.savePreset(name, desc, config);

        this.refreshPresetDropdown();
        document.getElementById('presetSelect').value = `custom_${saved.id}`;
        this.markUnsaved(false);
        modal.classList.add('hidden');
      });
    }

    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        if (this.customPresetManager.activePresetId) {
          this.customPresetManager.deletePreset(this.customPresetManager.activePresetId);
          this.refreshPresetDropdown();
          this.loadPreset('jee-example');
          modal.classList.add('hidden');
        }
      });
    }

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const config = this.exportConfig();
        const name = nameInput.value.trim() || 'custom-preset';
        const jsonStr = JSON.stringify({
          name,
          description: descInput.value.trim(),
          config
        }, null, 2);

        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (btnImport) {
      btnImport.addEventListener('click', () => fileImport.click());
    }

    if (fileImport) {
      fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const imported = this.customPresetManager.importPresetFromJson(evt.target.result);
            this.refreshPresetDropdown();
            this.loadCustomPreset(imported.id);
            modal.classList.add('hidden');
          } catch (err) {
            alert(err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  openPresetModal(mode = 'save') {
    const modal = document.getElementById('modalPreset');
    const title = document.getElementById('modalPresetTitle');
    const nameInput = document.getElementById('presetNameInput');
    const descInput = document.getElementById('presetDescInput');
    const btnDelete = document.getElementById('btnDeletePresetModal');

    modal.classList.remove('hidden');

    if (this.customPresetManager.activePresetId) {
      const active = this.customPresetManager.getPreset(this.customPresetManager.activePresetId);
      if (active) {
        nameInput.value = active.name;
        descInput.value = active.description;
        btnDelete.classList.remove('hidden');
      } else {
        nameInput.value = 'My Custom Simulation';
        descInput.value = '';
        btnDelete.classList.add('hidden');
      }
    } else {
      nameInput.value = 'My Custom Simulation';
      descInput.value = '';
      btnDelete.classList.add('hidden');
    }
  }

  bindVectorToggles() {
    const toggles = [
      { id: 'togglePosVec', key: 'showPos' },
      { id: 'toggleVelVec', key: 'showVel' },
      { id: 'toggleAccVec', key: 'showAcc' },
      { id: 'toggleComponents', key: 'showComponents' },
      { id: 'toggleRelVel', key: 'showRelVel' },
      { id: 'toggleRelAcc', key: 'showRelAcc' },
      { id: 'toggleRelPos', key: 'showRelPos' },
      { id: 'toggleTrajectory', key: 'showTrajectory' },
      { id: 'toggleLabels', key: 'showLabels' }
    ];

    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) {
        el.checked = this.vectorOptions[t.key];
        el.addEventListener('change', (e) => {
          this.vectorOptions[t.key] = e.target.checked;
        });
      }
    });
  }

  getGravityVector() {
    if (!this.gravityConfig.enabled) return Vector2.zero();
    const val = this.gravityConfig.value;
    switch (this.gravityConfig.direction) {
      case 'down': return new Vector2(0, -val);
      case 'up': return new Vector2(0, val);
      case 'left': return new Vector2(-val, 0);
      case 'right': return new Vector2(val, 0);
      default: return new Vector2(0, -val);
    }
  }

  loadPreset(presetKey) {
    const preset = Presets[presetKey];
    if (!preset) return;

    this.particles = preset.particles.map(p => p.clone());
    this.gravityConfig = { ...preset.environment };

    // Update environment UI
    document.getElementById('gravityEnable').checked = this.gravityConfig.enabled;
    document.getElementById('gravityValue').value = this.gravityConfig.value;
    document.getElementById('gravityDir').value = this.gravityConfig.direction;

    this.refParticleId = 'ground';
    this.customPresetManager.activePresetId = null;
    this.controls.resetTime();
    this.onParticleUpdated({ redrawInspectorCards: true });
    this.fitScene();
    this.markUnsaved(false);

    document.getElementById('presetSelect').value = presetKey;
  }

  loadCustomPreset(customId) {
    const preset = this.customPresetManager.getPreset(customId);
    if (!preset) return;

    this.loadConfig(preset.config);
    this.customPresetManager.activePresetId = customId;
    this.markUnsaved(false);

    document.getElementById('presetSelect').value = `custom_${customId}`;
  }

  addParticle() {
    const idx = this.particles.length + 1;
    const colors = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#a855f7'];
    const p = new Particle({
      name: `Particle ${String.fromCharCode(64 + idx)}`,
      color: colors[(idx - 1) % colors.length],
      r0: new Vector2(idx * 15, 0),
      v0: new Vector2(10, 10)
    });
    this.particles.push(p);
    this.onParticleUpdated({ redrawInspectorCards: true });
  }

  deleteParticle(id) {
    if (this.particles.length <= 1) return;
    this.particles = this.particles.filter(p => p.id !== id);
    if (this.refParticleId === id) this.refParticleId = 'ground';
    this.onParticleUpdated({ redrawInspectorCards: true });
  }

  setReferenceFrame(refId) {
    this.refParticleId = refId;

    // Update badge UI
    const badgeText = document.getElementById('frameBadgeText');
    if (badgeText) {
      if (refId === 'ground') {
        badgeText.textContent = 'Ground Frame (S)';
      } else {
        const refP = this.particles.find(p => p.id === refId);
        badgeText.textContent = `${refP ? refP.name : 'Particle'} Frame (S')`;
      }
    }

    this.markUnsaved(true);
    this.updateAnalysisAndExplanation();
  }

  updateEnvironment(config) {
    this.gravityConfig = { ...config };
    this.markUnsaved(true);
    this.updateAnalysisAndExplanation();
  }

  onParticleUpdated(options = { redrawInspectorCards: false }) {
    this.inspector.updateRefFrameSelect(this.particles, this.refParticleId);
    if (options.redrawInspectorCards) {
      this.inspector.renderParticleCards(this.particles, this.selectedParticleId, this.refParticleId);
    }
    this.markUnsaved(true);
    this.updateAnalysisAndExplanation();
  }

  markUnsaved(unsaved = true) {
    this.customPresetManager.isUnsaved = unsaved;
    const star = document.getElementById('presetUnsavedIndicator');
    if (star) {
      if (unsaved) star.classList.remove('hidden');
      else star.classList.add('hidden');
    }
  }

  onTimeUpdate(t) {
    this.updateAnalysisAndExplanation();
    if (this.graphs) this.graphs.render();
  }

  updateAnalysisAndExplanation() {
    const gravity = this.getGravityVector();
    const time = this.controls ? this.controls.currentTime : 0;

    const frameState = RelativeMotion.transformToFrame(this.particles, this.refParticleId, gravity, time);

    if (this.particles.length >= 2) {
      const pA = this.particles[0];
      const pB = this.particles[1];

      const closest = ClosestApproach.calculate(pA, pB, gravity);
      const collision = Collision.checkCollision(pA, pB, gravity);

      const stateA = frameState.states.get(pA.id);
      const stateB = frameState.states.get(pB.id);

      const rBA = stateB.position.sub(stateA.position);
      const vBA = stateB.velocity.sub(stateA.velocity);
      const aBA = stateB.acceleration.sub(stateA.acceleration);

      const currDistance = rBA.magnitude();
      const currVrel = vBA.magnitude();

      // Update Analysis Panel Cards
      this.panels.updateAnalysisMetrics({
        closest,
        collision,
        currDistance,
        currVrel,
        rBA,
        vBA,
        aBA
      });

      // Update Explanation Panel Text
      const expContent = document.getElementById('explanationContent');
      if (expContent) {
        expContent.innerHTML = ExplanationGenerator.generate(
          this.particles,
          this.refParticleId,
          gravity,
          closest,
          collision
        );
      }
    }
  }

  /**
   * Signature Feature: Makes relative motion obvious visually and conceptually.
   */
  makeRelativeMotionObvious() {
    if (this.particles.length >= 1) {
      const targetRefId = this.particles[0].id; // Choose Particle A
      this.setReferenceFrame(targetRefId);

      // Select Reference Frame dropdown
      const refSelect = document.getElementById('refFrameSelect');
      if (refSelect) refSelect.value = targetRefId;

      // Ensure vector toggles highlight relative velocity & acceleration
      this.vectorOptions.showRelVel = true;
      this.vectorOptions.showRelAcc = true;
      this.vectorOptions.showRelPos = true;
      this.bindVectorToggles();

      // Switch tab to Explanation
      const expTabBtn = document.querySelector('.tab-btn[data-tab="tab-explanation"]');
      if (expTabBtn) expTabBtn.click();

      this.fitScene();
    }
  }

  fitScene() {
    if (this.particles.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const gravity = this.getGravityVector();

    let sampleTime = 5;
    if (gravity.y < 0) {
      this.particles.forEach(p => {
        if (p.v0.y > 0) {
          const tFlight = (2 * p.v0.y) / Math.abs(gravity.y);
          if (tFlight > sampleTime) sampleTime = tFlight;
        }
      });
    }

    for (let t = 0; t <= sampleTime; t += 0.5) {
      const frameState = RelativeMotion.transformToFrame(this.particles, this.refParticleId, gravity, t);
      frameState.states.forEach(st => {
        if (st.position.x < minX) minX = st.position.x;
        if (st.position.x > maxX) maxX = st.position.x;
        if (st.position.y < minY) minY = st.position.y;
        if (st.position.y > maxY) maxY = st.position.y;
      });
    }

    if (this.refParticleId === 'ground' && this.gravityConfig.enabled && minY < 0) {
      minY = 0;
    }

    this.canvasManager.camera.fitBounds(minX, maxX, minY, maxY);
  }

  exportConfig() {
    return {
      environment: this.gravityConfig,
      referenceFrame: this.refParticleId,
      particles: this.particles.map(p => ({
        name: p.name,
        color: p.color,
        x0: p.r0.x,
        y0: p.r0.y,
        vx: p.v0.x,
        vy: p.v0.y,
        ax: p.a0.x,
        ay: p.a0.y
      }))
    };
  }

  loadConfig(config) {
    if (config.environment) {
      this.gravityConfig = config.environment;
      document.getElementById('gravityEnable').checked = this.gravityConfig.enabled;
      document.getElementById('gravityValue').value = this.gravityConfig.value;
      document.getElementById('gravityDir').value = this.gravityConfig.direction;
    }
    if (config.particles) {
      this.particles = config.particles.map(cfg => new Particle({
        name: cfg.name,
        color: cfg.color,
        r0: new Vector2(cfg.x0, cfg.y0),
        v0: new Vector2(cfg.vx, cfg.vy),
        a0: new Vector2(cfg.ax, cfg.ay)
      }));
    }
    this.refParticleId = config.referenceFrame || 'ground';
    this.onParticleUpdated({ redrawInspectorCards: true });
    this.fitScene();
  }

  loop(timestamp) {
    this.controls.update(timestamp);

    const currentTime = this.controls.currentTime;
    const gravity = this.getGravityVector();

    const frameState = RelativeMotion.transformToFrame(this.particles, this.refParticleId, gravity, currentTime);

    this.canvasManager.renderBackground();

    if (this.vectorOptions.showTrajectory) {
      TrajectoryRenderer.render(
        this.canvasManager.ctx,
        this.canvasManager.camera,
        this.particles,
        this.refParticleId,
        gravity,
        this.controls.maxTime
      );
    }

    VectorRenderer.renderVectors(
      this.canvasManager.ctx,
      this.canvasManager.camera,
      this.particles,
      frameState.states,
      this.vectorOptions
    );

    ParticleRenderer.render(
      this.canvasManager.ctx,
      this.canvasManager.camera,
      this.particles,
      frameState.states,
      this.selectedParticleId,
      this.refParticleId
    );

    LabelRenderer.renderLabels(
      this.canvasManager.ctx,
      this.canvasManager.camera,
      this.particles,
      frameState.states,
      this.vectorOptions
    );

    requestAnimationFrame((ts) => this.loop(ts));
  }
}

// Initialize Application on Window Load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new RelativeMotionApp();
});
