import { Vector2 } from './vector2.js';

/**
 * Analytical Kinematics calculations for constant acceleration motion.
 */
export const Kinematics = {
  /**
   * Calculates position at time t given initial position r0, initial velocity v0, and net acceleration a.
   * r(t) = r0 + v0*t + 0.5*a*t^2
   */
  positionAtTime(r0, v0, a, t) {
    if (t < 0) t = 0;
    return r0.add(v0.scale(t)).add(a.scale(0.5 * t * t));
  },

  /**
   * Calculates velocity at time t given initial velocity v0 and net acceleration a.
   * v(t) = v0 + a*t
   */
  velocityAtTime(v0, a, t) {
    if (t < 0) t = 0;
    return v0.add(a.scale(t));
  },

  /**
   * Evaluates state of a particle at time t considering environment gravity.
   */
  getParticleState(particle, gravityVector, t) {
    const netAcc = particle.a0.add(gravityVector);
    const pos = Kinematics.positionAtTime(particle.r0, particle.v0, netAcc, t);
    const vel = Kinematics.velocityAtTime(particle.v0, netAcc, t);

    return {
      position: pos,
      velocity: vel,
      acceleration: netAcc,
      speed: vel.magnitude()
    };
  }
};
