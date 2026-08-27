import { Vector2 } from './vector2.js';
import { Kinematics } from './kinematics.js';

/**
 * Calculations for relative motion frame transformations.
 */
export const RelativeMotion = {
  /**
   * Computes relative position r_BA = r_B - r_A
   */
  relativePosition(posA, posB) {
    return posB.sub(posA);
  },

  /**
   * Computes relative velocity v_BA = v_B - v_A
   */
  relativeVelocity(velA, velB) {
    return velB.sub(velA);
  },

  /**
   * Computes relative acceleration a_BA = a_B - a_A
   */
  relativeAcceleration(accA, accB) {
    return accB.sub(accA);
  },

  /**
   * Transforms all particles into the frame of a reference particle.
   * If refParticle is null, returns ground frame states.
   */
  transformToFrame(particles, refParticleId, gravityVector, time) {
    const states = new Map();

    // First calculate ground states for all particles
    particles.forEach(p => {
      states.set(p.id, Kinematics.getParticleState(p, gravityVector, time));
    });

    if (!refParticleId || refParticleId === 'ground' || !states.has(refParticleId)) {
      return {
        refParticleId: 'ground',
        states
      };
    }

    const refState = states.get(refParticleId);
    const transformedStates = new Map();

    particles.forEach(p => {
      const state = states.get(p.id);
      transformedStates.set(p.id, {
        position: state.position.sub(refState.position),
        velocity: state.velocity.sub(refState.velocity),
        acceleration: state.acceleration.sub(refState.acceleration),
        speed: state.velocity.sub(refState.velocity).magnitude()
      });
    });

    return {
      refParticleId,
      states: transformedStates
    };
  }
};
