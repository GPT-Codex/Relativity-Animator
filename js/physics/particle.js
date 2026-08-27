import { Vector2 } from './vector2.js';
import { Units } from './units.js';

/**
 * Particle model representing a physical object in 2D space.
 */
export class Particle {
  constructor(config = {}) {
    this.id = config.id || `particle_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    this.name = config.name || 'Particle';
    this.color = config.color || '#38bdf8';

    // Initial kinematic state
    this.r0 = config.r0 ? new Vector2(config.r0.x, config.r0.y) : new Vector2(0, 0);
    this.v0 = config.v0 ? new Vector2(config.v0.x, config.v0.y) : new Vector2(0, 0);

    // Object-specific constant acceleration (e.g. engine thrust or individual acceleration)
    this.a0 = config.a0 ? new Vector2(config.a0.x, config.a0.y) : new Vector2(0, 0);

    // Particle visual radius in meters
    this.radius = config.radius !== undefined ? config.radius : 1.0;
  }

  // Speed and Angle getters/setters
  get speed() {
    return this.v0.magnitude();
  }

  get angleDeg() {
    let deg = this.v0.angleDegrees();
    return deg < 0 ? deg + 360 : deg;
  }

  setSpeedAndAngle(speed, angleDeg) {
    this.v0 = Vector2.fromPolar(speed, angleDeg);
  }

  setVxVy(vx, vy) {
    this.v0 = new Vector2(vx, vy);
  }

  clone() {
    return new Particle({
      id: this.id,
      name: this.name,
      color: this.color,
      r0: this.r0.clone(),
      v0: this.v0.clone(),
      a0: this.a0.clone(),
      radius: this.radius
    });
  }
}
