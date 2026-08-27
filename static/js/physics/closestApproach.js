import { Vector2 } from './vector2.js';

/**
 * Analytical calculations for time of closest approach and minimum separation.
 */
export const ClosestApproach = {
  /**
   * Calculates minimum separation and time of closest approach between two particles.
   * Uses initial relative position r0, initial relative velocity v0, and relative acceleration a.
   * r_BA(t) = r0 + v0*t + 0.5*a*t^2
   * d^2(t) = |r_BA(t)|^2
   */
  calculate(pA, pB, gravityVector, maxSearchTime = 100) {
    const netAccA = pA.a0.add(gravityVector);
    const netAccB = pB.a0.add(gravityVector);

    const r0 = pB.r0.sub(pA.r0);
    const v0 = pB.v0.sub(pA.v0);
    const a = netAccB.sub(netAccA);

    // Case 1: Constant relative velocity (a_BA == 0)
    if (a.magnitudeSquared() < 1e-9) {
      const v0MagSq = v0.magnitudeSquared();
      let tMin = 0;
      if (v0MagSq > 1e-9) {
        tMin = -r0.dot(v0) / v0MagSq;
      }

      // If tMin < 0, closest approach was at t = 0 (or in past)
      if (tMin < 0) tMin = 0;

      const rMin = r0.add(v0.scale(tMin));
      const dMin = rMin.magnitude();

      return {
        tMin,
        dMin,
        relativePosAtMin: rMin,
        relativeVelAtMin: v0,
        relativeAcc: a,
        isConstantRelativeVelocity: true
      };
    }

    // Case 2: Constant relative acceleration (a_BA != 0)
    // d^2(t) = |r0 + v0*t + 0.5*a*t^2|^2
    // d/dt [d^2(t)] = 2 * r_BA(t) . (v0 + a*t) = 0
    // (r0 + v0*t + 0.5*a*t^2) . (v0 + a*t) = 0
    // 0.5*|a|^2 * t^3 + 1.5*(a.v0)*t^2 + (r0.a + |v0|^2)*t + (r0.v0) = 0
    // Cubic polynomial: c3*t^3 + c2*t^2 + c1*t + c0 = 0
    const c3 = 0.5 * a.magnitudeSquared();
    const c2 = 1.5 * a.dot(v0);
    const c1 = r0.dot(a) + v0.magnitudeSquared();
    const c0 = r0.dot(v0);

    const roots = ClosestApproach.solveCubic(c3, c2, c1, c0);

    // Filter valid non-negative times t >= 0
    let validTimes = roots.filter(t => typeof t === 'number' && !isNaN(t) && t >= 0);
    validTimes.push(0); // Always evaluate t = 0 boundary

    let bestT = 0;
    let minDSq = Infinity;

    validTimes.forEach(t => {
      const r_t = r0.add(v0.scale(t)).add(a.scale(0.5 * t * t));
      const dSq = r_t.magnitudeSquared();
      if (dSq < minDSq) {
        minDSq = dSq;
        bestT = t;
      }
    });

    const rMin = r0.add(v0.scale(bestT)).add(a.scale(0.5 * bestT * bestT));
    const vMin = v0.add(a.scale(bestT));

    return {
      tMin: bestT,
      dMin: Math.sqrt(minDSq),
      relativePosAtMin: rMin,
      relativeVelAtMin: vMin,
      relativeAcc: a,
      isConstantRelativeVelocity: false
    };
  },

  /**
   * Helper to solve cubic equation ax^3 + bx^2 + cx + d = 0
   */
  solveCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-9) {
      // Degenerate to quadratic: bx^2 + cx + d = 0
      if (Math.abs(b) < 1e-9) {
        // Degenerate to linear: cx + d = 0
        if (Math.abs(c) < 1e-9) return [];
        return [-d / c];
      }
      const disc = c * c - 4 * b * d;
      if (disc < 0) return [];
      return [(-c + Math.sqrt(disc)) / (2 * b), (-c - Math.sqrt(disc)) / (2 * b)];
    }

    // Standard Cardano's method for cubic equation
    const A = b / a;
    const B = c / a;
    const C = d / a;

    const Q = (3 * B - A * A) / 9;
    const R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
    const D = Q * Q * Q + R * R; // Polynomial discriminant

    const roots = [];

    if (D >= 0) {
      // One real root and two complex/repeated
      const S = Math.cbrt(R + Math.sqrt(D));
      const T = Math.cbrt(R - Math.sqrt(D));
      roots.push(-A / 3 + (S + T));
    } else {
      // Three real roots (Casus irreducibilis)
      const th = Math.acos(R / Math.sqrt(-Q * Q * Q));
      const sqrtQ = Math.sqrt(-Q);
      roots.push(2 * sqrtQ * Math.cos(th / 3) - A / 3);
      roots.push(2 * sqrtQ * Math.cos((th + 2 * Math.PI) / 3) - A / 3);
      roots.push(2 * sqrtQ * Math.cos((th + 4 * Math.PI) / 3) - A / 3);
    }

    return roots;
  }
};
