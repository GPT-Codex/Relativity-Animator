/**
 * Animation playback controller and timeline scrubber.
 */
export class ControlsController {
  constructor(app) {
    this.app = app;
    this.isPlaying = false;
    this.currentTime = 0;
    this.maxTime = 10;
    this.playbackSpeed = 1.0;
    this.lastTimestamp = null;

    this.bindElements();
  }

  bindElements() {
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.playIcon = document.getElementById('playIcon');
    this.pauseIcon = document.getElementById('pauseIcon');
    this.btnReset = document.getElementById('btnReset');
    this.btnStepForward = document.getElementById('btnStepForward');
    this.btnStepBack = document.getElementById('btnStepBack');
    this.btnJumpStart = document.getElementById('btnJumpStart');

    this.timeScrubber = document.getElementById('timeScrubber');
    this.timeDisplay = document.getElementById('timeDisplay');
    this.speedSelect = document.getElementById('speedSelect');

    // Event Listeners
    this.btnPlayPause.addEventListener('click', () => this.togglePlay());
    this.btnReset.addEventListener('click', () => this.resetTime());
    this.btnJumpStart.addEventListener('click', () => this.setTime(0));
    this.btnStepForward.addEventListener('click', () => this.step(0.05));
    this.btnStepBack.addEventListener('click', () => this.step(-0.05));

    this.timeScrubber.addEventListener('input', (e) => {
      this.setTime(parseFloat(e.target.value));
    });

    this.speedSelect.addEventListener('change', (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.step(0.05);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.step(-0.05);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.resetTime();
      }
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playIcon.classList.add('hidden');
      this.pauseIcon.classList.remove('hidden');
      this.lastTimestamp = null;
    } else {
      this.playIcon.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
    }
  }

  pause() {
    this.isPlaying = false;
    this.playIcon.classList.remove('hidden');
    this.pauseIcon.classList.add('hidden');
  }

  setTime(t) {
    this.currentTime = Math.max(0, Math.min(this.maxTime, t));
    this.timeScrubber.value = this.currentTime;
    this.timeDisplay.textContent = `t = ${this.currentTime.toFixed(3)} s`;
    this.app.onTimeUpdate(this.currentTime);
  }

  resetTime() {
    this.pause();
    this.setTime(0);
  }

  step(dt) {
    this.pause();
    this.setTime(this.currentTime + dt);
  }

  update(timestamp) {
    if (!this.isPlaying) return;

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return;
    }

    const elapsedSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    const dt = elapsedSeconds * this.playbackSpeed;
    let nextTime = this.currentTime + dt;

    if (nextTime >= this.maxTime) {
      nextTime = this.maxTime;
      this.pause();
    }

    this.setTime(nextTime);
  }
}
