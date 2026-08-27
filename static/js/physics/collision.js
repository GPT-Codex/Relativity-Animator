import { ClosestApproach } from './closestApproach.js';

/**
 * Collision detection and collision time calculation.
 */
export const Collision = {
  /**
   * Checks if two particles collide during motion and determines exact collision time.
   * Collision occurs when separation distance d(t) <= r_A + r_B.
   */
  checkCollision(pA, pB, gravityVector) {
    const combinedRadius = (pA.radius || 0) + (pB.radius || 0);
    const closest = ClosestApproach.calculate(pA, pB, gravityVector);

    const initialDistance = pB.r0.sub(pA.r0).magnitude();
    if (initialDistance <= combinedRadius) {
      return {
        collided: true,
        collisionTime: 0,
        distanceAtCollision: initialDistance,
        dMin: closest.dMin,
        tMin: closest.tMin
      };
    }

    if (closest.dMin <= combinedRadius + 1e-4) {
      // Find time when separation equals combinedRadius
      // Solve |r_BA(t)| = combinedRadius
      const tCollision = Collision.findCollisionTime(pA, pB, gravityVector, combinedRadius, closest.tMin);
      return {
        collided: true,
        collisionTime: tCollision,
        distanceAtCollision: combinedRadius,
        dMin: closest.dMin,
        tMin: closest.tMin
      };
    }

    return {
      collided: false,
      collisionTime: null,
      dMin: closest.dMin,
      tMin: closest.tMin
    };
  },

  findCollisionTime(pA, pB, gravityVector, targetDistance, tMinEstimate) {
    const netAccA = pA.a0.add(gravityVector);
    const netAccB = pB.a0.add(gravityVector);

    const r0 = pB.r0.sub(pA.r0);
    const v0 = pB.v0.sub(pA.v0);
    const a = netAccB.sub(netAccA);

    // Simple bisection search between t = 0 and tMinEstimate
    let low = 0;
    let high = tMinEstimate > 0 ? tMinEstimate : 100;

    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const r_mid = r0.add(v0.scale(mid)).add(a.scale(0.5 * mid * mid));
      const d_mid = r_mid.magnitude();

      if (d_mid > targetDistance) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return (low + high) / 2;
  }
};
