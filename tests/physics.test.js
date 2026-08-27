import { Vector2 } from '../js/physics/vector2.js';
import { Particle } from '../js/physics/particle.js';
import { RelativeMotion } from '../js/physics/relativeMotion.js';
import { ClosestApproach } from '../js/physics/closestApproach.js';
import { Collision } from '../js/physics/collision.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('=== Running Acceptance Tests A - E ===\n');

// Test A — Identical acceleration
(() => {
  const pA = new Particle({ name: 'A', a0: new Vector2(2, -9.8) });
  const pB = new Particle({ name: 'B', a0: new Vector2(2, -9.8) });
  const gravity = new Vector2(0, -9.8);

  const stateA = { acceleration: pA.a0.add(gravity) };
  const stateB = { acceleration: pB.a0.add(gravity) };

  const relAcc = RelativeMotion.relativeAcceleration(stateA.acceleration, stateB.acceleration);
  assert(relAcc.magnitude() < 1e-9, 'Test A: Identical acceleration produces a_BA = 0');
})();

// Test B — Same velocity
(() => {
  const pA = new Particle({ name: 'A', v0: new Vector2(10, 15) });
  const pB = new Particle({ name: 'B', v0: new Vector2(10, 15) });

  const relVel = RelativeMotion.relativeVelocity(pA.v0, pB.v0);
  assert(relVel.magnitude() < 1e-9, 'Test B: Same velocity produces v_BA = 0');
})();

// Test C — Collision
(() => {
  const pA = new Particle({ name: 'A', r0: new Vector2(0, 0), v0: new Vector2(10, 0), radius: 1.0 });
  const pB = new Particle({ name: 'B', r0: new Vector2(50, 0), v0: new Vector2(-10, 0), radius: 1.0 });
  const gravity = Vector2.zero();

  const colResult = Collision.checkCollision(pA, pB, gravity);
  assert(colResult.collided === true, 'Test C: Colliding particles detected correctly');
  assert(Math.abs(colResult.collisionTime - 2.4) < 1e-2, 'Test C: Collision time matches analytical solve (t = 2.4s for combined radius 2m)');
})();

// Test D — Closest approach
(() => {
  // Analytical test: pA at (0, 0) moving (10, 0), pB at (0, 30) moving (0, -10)
  const pA = new Particle({ name: 'A', r0: new Vector2(0, 0), v0: new Vector2(10, 0) });
  const pB = new Particle({ name: 'B', r0: new Vector2(0, 30), v0: new Vector2(0, -10) });
  const gravity = Vector2.zero();

  const closest = ClosestApproach.calculate(pA, pB, gravity);
  const expectedT = 1.5;
  const expectedD = 15 * Math.SQRT2;

  assert(Math.abs(closest.tMin - expectedT) < 1e-5, 'Test D: Closest approach t_min matches analytical solution (1.5s)');
  assert(Math.abs(closest.dMin - expectedD) < 1e-5, 'Test D: Closest approach d_min matches analytical solution (21.21 m)');
})();

// Test E — Example problem
(() => {
  const pA = new Particle({ name: 'A', r0: new Vector2(0, 0) });
  pA.setSpeedAndAngle(14, 45);

  const pB = new Particle({ name: 'B', r0: new Vector2(60, 0) });
  pB.setSpeedAndAngle(2, 45);

  const gravity = new Vector2(0, -9.8);

  const closest = ClosestApproach.calculate(pA, pB, gravity);
  const expectedD = 30 * Math.SQRT2; // 42.4264 m

  assert(Math.abs(closest.dMin - expectedD) < 1e-4, 'Test E: JEE 60m Example problem yields d_min = 30*sqrt(2) = 42.43 m');
})();

console.log('\nAll 5 Acceptance Tests (A - E) PASSED successfully!');
