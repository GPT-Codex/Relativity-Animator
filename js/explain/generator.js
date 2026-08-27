import { Vector2 } from '../physics/vector2.js';
import { Units } from '../physics/units.js';

/**
 * Dynamic Step-by-Step Mathematical Explanation Generator.
 * Answers the student's question: "Why is this equation allowed?"
 */
export const ExplanationGenerator = {
  generate(particles, refFrameId, gravityVector, closest, collision) {
    if (!particles || particles.length < 2) {
      return `
        <div class="step-block">
          <div class="step-title">Minimum 2 Objects Required</div>
          <p>Add at least two particles to generate relative motion explanations and minimum separation derivations.</p>
        </div>
      `;
    }

    const pA = particles[0];
    const pB = particles[1];

    const isRefA = (refFrameId === pA.id);
    const refName = isRefA ? pA.name : (refFrameId === pB.id ? pB.name : 'Ground Frame');
    const otherName = isRefA ? pB.name : pA.name;

    const r0A = pA.r0;
    const r0B = pB.r0;
    const v0A = pA.v0;
    const v0B = pB.v0;

    const netAccA = pA.a0.add(gravityVector);
    const netAccB = pB.a0.add(gravityVector);

    const r0_BA = r0B.sub(r0A);
    const v0_BA = v0B.sub(v0A);
    const a_BA = netAccB.sub(netAccA);

    const isZeroRelAcc = a_BA.magnitudeSquared() < 1e-7;

    return `
      <div class="step-block">
        <div class="step-title">Step 1: Reference Frame Selection</div>
        <p>Choose <strong>${refName}</strong> as the reference frame. By transforming into ${refName}'s frame, ${refName} is brought to rest at the origin, simplifying a 2-body moving problem into a 1-body motion problem.</p>
      </div>

      <div class="step-block">
        <div class="step-title">Step 2: Initial Relative Position & Relative Velocity</div>
        <p>
          Initial Relative Position: <span class="formula-highlight">r_BA = r_B - r_A = (${r0_BA.x.toFixed(2)}, ${r0_BA.y.toFixed(2)}) m</span><br>
          Initial Relative Velocity: <span class="formula-highlight">v_BA = v_B - v_A = (${v0_BA.x.toFixed(2)}, ${v0_BA.y.toFixed(2)}) m/s</span>
          (Magnitude: <strong>${v0_BA.magnitude().toFixed(2)} m/s</strong>, Angle: <strong>${v0_BA.angleDegrees().toFixed(1)}°</strong>)
        </p>
      </div>

      <div class="step-block">
        <div class="step-title">Step 3: Relative Acceleration Simplification</div>
        <p>
          Both particles experience net accelerations: <br>
          a_A = (${netAccA.x.toFixed(2)}, ${netAccA.y.toFixed(2)}) m/s²,
          a_B = (${netAccB.x.toFixed(2)}, ${netAccB.y.toFixed(2)}) m/s²<br>
          Relative Acceleration: <span class="formula-highlight">a_BA = a_B - a_A = (${a_BA.x.toFixed(2)}, ${a_BA.y.toFixed(2)}) m/s²</span>
        </p>
        ${isZeroRelAcc ? `
          <p style="color: #10b981; margin-top: 0.3rem;">
            ✓ <strong>Key Physical Insight:</strong> Because relative acceleration <span class="formula-highlight">a_BA = 0</span>,
            the relative motion of ${otherName} with respect to ${refName} is a <strong>pure uniform straight-line trajectory</strong>!
            The parabolic curves in the ground frame reduce to a simple straight line in the relative frame.
          </p>
        ` : `
          <p style="color: #f59e0b; margin-top: 0.3rem;">
            Because a_BA ≠ 0, the relative trajectory is parabolic relative to ${refName}.
          </p>
        `}
      </div>

      <div class="step-block">
        <div class="step-title">Step 4: Minimum Separation Condition (Closest Approach)</div>
        <p>
          Minimum separation occurs when the separation distance vector <span class="formula-highlight">r_BA(t)</span> is
          <strong>perpendicular</strong> to the relative velocity vector <span class="formula-highlight">v_BA(t)</span>,
          which corresponds to <span class="formula-highlight">d/dt [d²(t)] = 0</span>.
        </p>
        ${isZeroRelAcc ? `
          <p>
            Analytical time formula: <span class="formula-highlight">t_min = -(r_0 · v_0) / |v_0|² = ${closest.tMin.toFixed(2)} s</span><br>
            Perpendicular minimum distance: <span class="formula-highlight">d_min = |r_0 × v_0| / |v_0| = ${closest.dMin.toFixed(2)} m</span>
          </p>
        ` : `
          <p>
            Solving cubic root condition yields time of closest approach:
            <span class="formula-highlight">t_min = ${closest.tMin.toFixed(2)} s</span>, giving
            <span class="formula-highlight">d_min = ${closest.dMin.toFixed(2)} m</span>.
          </p>
        `}
      </div>

      <div class="step-block">
        <div class="step-title">Step 5: Final Result & Collision Analysis</div>
        <p>
          Minimum Distance: <strong style="color: var(--primary); font-size: 1.1em;">d_min = ${closest.dMin.toFixed(2)} m</strong> at <strong style="color: var(--primary);">t = ${closest.tMin.toFixed(2)} s</strong>.<br>
          ${collision.collided ?
            `<span style="color: #10b981;">✓ Particles collide at t = ${collision.collisionTime.toFixed(2)} s!</span>` :
            `<span style="color: #f43f5e;">✗ Particles do not collide (minimum separation ${closest.dMin.toFixed(2)} m > combined radius).</span>`
          }
        </p>
      </div>
    `;
  }
};
