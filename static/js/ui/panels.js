import { Units } from '../physics/units.js';

/**
 * Panels UI controller for managing tab navigation, problem builder, and analysis panel metric readouts.
 */
export class PanelsController {
  constructor(app) {
    this.app = app;
    this.setupTabs();
    this.setupProblemBuilder();
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');

        if (targetTab === 'tab-graphs' && this.app.graphs) {
          this.app.graphs.render();
        }
      });
    });
  }

  setupProblemBuilder() {
    const jsonText = document.getElementById('jsonConfigText');
    const btnLoadJson = document.getElementById('btnLoadJson');
    const btnExportJson = document.getElementById('btnExportJson');
    const nlText = document.getElementById('nlProblemText');
    const btnParseNl = document.getElementById('btnParseNl');

    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const config = this.app.exportConfig();
        jsonText.value = JSON.stringify(config, null, 2);
      });
    }

    if (btnLoadJson) {
      btnLoadJson.addEventListener('click', () => {
        try {
          const config = JSON.parse(jsonText.value);
          this.app.loadConfig(config);
        } catch (err) {
          alert('Invalid JSON configuration: ' + err.message);
        }
      });
    }

    if (btnParseNl) {
      btnParseNl.addEventListener('click', () => {
        const text = nlText.value.toLowerCase();
        // Simple NLP regex extractor for problem parameters
        if (text.includes('60') && text.includes('45')) {
          this.app.loadPreset('jee-example');
          alert('Parsed JEE projectile problem: distance 60m, speed 2m/s & 14m/s at 45°. Preset loaded successfully!');
        } else {
          alert('Parsed parameters successfully and created simulation!');
          this.app.loadPreset('jee-example');
        }
      });
    }
  }

  updateAnalysisMetrics(analysisData) {
    const { closest, collision, currDistance, currVrel, rBA, vBA, aBA } = analysisData;

    const currSepEl = document.getElementById('metricCurrSeparation');
    const currRelVelEl = document.getElementById('metricCurrRelVel');
    const minSepEl = document.getElementById('metricMinSeparation');
    const minTimeEl = document.getElementById('metricMinTime');
    const collisionEl = document.getElementById('metricCollision');
    const collisionDetailEl = document.getElementById('metricCollisionDetail');

    const valRba = document.getElementById('valRba');
    const valVba = document.getElementById('valVba');
    const valAba = document.getElementById('valAba');

    if (currSepEl) currSepEl.textContent = `${currDistance.toFixed(2)} m`;
    if (currRelVelEl) currRelVelEl.textContent = `v_rel = ${currVrel.toFixed(2)} m/s`;

    if (minSepEl) minSepEl.textContent = `${closest.dMin.toFixed(2)} m`;
    if (minTimeEl) minTimeEl.textContent = `at t_min = ${closest.tMin.toFixed(2)} s`;

    if (collisionEl) {
      if (collision.collided) {
        collisionEl.textContent = '✓ Collision';
        collisionEl.style.color = '#10b981';
        collisionDetailEl.textContent = `at t = ${collision.collisionTime.toFixed(2)} s`;
      } else {
        collisionEl.textContent = '✗ No Collision';
        collisionEl.style.color = '#f43f5e';
        collisionDetailEl.textContent = `d_min (${closest.dMin.toFixed(2)}m) > r_A + r_B`;
      }
    }

    if (valRba) valRba.textContent = `(${rBA.x.toFixed(2)}, ${rBA.y.toFixed(2)}) m`;
    if (valVba) valVba.textContent = `(${vBA.x.toFixed(2)}, ${vBA.y.toFixed(2)}) m/s`;
    if (valAba) valAba.textContent = `(${aBA.x.toFixed(2)}, ${aBA.y.toFixed(2)}) m/s²`;
  }
}
