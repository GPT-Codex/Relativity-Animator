import { Vector2 } from '../physics/vector2.js';
import { Particle } from '../physics/particle.js';

export const Presets = {
  'jee-example': {
    name: 'JEE Example Problem (60m Projectiles)',
    description: 'Two particles separated by 60m projected simultaneously at 45° with 14 m/s and 2 m/s.',
    environment: { enabled: true, value: 9.8, direction: 'down' },
    particles: [
      new Particle({
        id: 'pA',
        name: 'Particle A',
        color: '#38bdf8',
        r0: new Vector2(0, 0),
        v0: Vector2.fromPolar(14, 45),
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pB',
        name: 'Particle B',
        color: '#f43f5e',
        r0: new Vector2(60, 0),
        v0: Vector2.fromPolar(2, 45),
        a0: new Vector2(0, 0)
      })
    ]
  },

  'river-crossing': {
    name: 'River Crossing (Boat & Water)',
    description: 'A boat attempting to cross a river flowing downstream.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pWater',
        name: 'River Water',
        color: '#0284c7',
        r0: new Vector2(0, 0),
        v0: new Vector2(5, 0), // River velocity 5 m/s right
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pBoat',
        name: 'Boat / Swimmer',
        color: '#f59e0b',
        r0: new Vector2(0, 0),
        v0: new Vector2(5, 10), // Boat heading North-East relative to ground
        a0: new Vector2(0, 0)
      })
    ]
  },

  'rain-observer': {
    name: 'Rain & Moving Observer',
    description: 'Rain falling vertically relative to ground, observed by a person running horizontally.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pPerson',
        name: 'Observer / Man',
        color: '#10b981',
        r0: new Vector2(0, 0),
        v0: new Vector2(8, 0), // Man running at 8 m/s
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pRain',
        name: 'Raindrop',
        color: '#38bdf8',
        r0: new Vector2(20, 30),
        v0: new Vector2(0, -12), // Rain falling vertically at 12 m/s
        a0: new Vector2(0, 0)
      })
    ]
  },

  'two-trains': {
    name: 'Two Trains on Parallel Tracks',
    description: 'Two trains approaching each other with constant velocities.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pTrainA',
        name: 'Train A',
        color: '#a855f7',
        r0: new Vector2(0, 0),
        v0: new Vector2(20, 0),
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pTrainB',
        name: 'Train B',
        color: '#f43f5e',
        r0: new Vector2(200, 0),
        v0: new Vector2(-15, 0),
        a0: new Vector2(0, 0)
      })
    ]
  },

  'wind-aircraft': {
    name: 'Aircraft & Wind Velocity',
    description: 'An airplane flying through crosswind.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pWind',
        name: 'Crosswind',
        color: '#94a3b8',
        r0: new Vector2(0, 0),
        v0: new Vector2(15, -5),
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pPlane',
        name: 'Aircraft',
        color: '#38bdf8',
        r0: new Vector2(0, 0),
        v0: new Vector2(50, 40),
        a0: new Vector2(0, 0)
      })
    ]
  },

  'pursuit': {
    name: 'Pursuit Problem',
    description: 'Particle A moving in a line while Particle B pursues it.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pTarget',
        name: 'Target A',
        color: '#10b981',
        r0: new Vector2(0, 40),
        v0: new Vector2(10, 0),
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pChaser',
        name: 'Chaser B',
        color: '#f43f5e',
        r0: new Vector2(0, 0),
        v0: new Vector2(12, 16),
        a0: new Vector2(0, 0)
      })
    ]
  },

  'closest-approach': {
    name: 'Arbitrary Closest Approach',
    description: 'Two objects moving with arbitrary initial velocities and accelerations.',
    environment: { enabled: false, value: 0, direction: 'down' },
    particles: [
      new Particle({
        id: 'pObjA',
        name: 'Object A',
        color: '#38bdf8',
        r0: new Vector2(-20, 10),
        v0: new Vector2(12, -2),
        a0: new Vector2(0, 0)
      }),
      new Particle({
        id: 'pObjB',
        name: 'Object B',
        color: '#f59e0b',
        r0: new Vector2(30, -15),
        v0: new Vector2(-8, 14),
        a0: new Vector2(0, 0)
      })
    ]
  }
};
