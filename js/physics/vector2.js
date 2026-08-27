/**
 * Immutable 2D Vector class for kinematics and physics calculations.
 */
export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
  }

  static zero() {
    return new Vector2(0, 0);
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  multiply(s) {
    return this.scale(s);
  }

  divide(s) {
    if (s === 0) return Vector2.zero();
    return new Vector2(this.x / s, this.y / s);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    // 2D cross product scalar (z-component)
    return this.x * v.y - this.y * v.x;
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  magSq() {
    return this.magnitudeSquared();
  }

  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  mag() {
    return this.magnitude();
  }

  normalize() {
    const m = this.magnitude();
    if (m === 0) return Vector2.zero();
    return this.divide(m);
  }

  angle() {
    // Returns angle in radians relative to positive X-axis
    return Math.atan2(this.y, this.x);
  }

  angleDegrees() {
    return (this.angle() * 180) / Math.PI;
  }

  static fromPolar(speed, angleDegrees) {
    const rad = (angleDegrees * Math.PI) / 180;
    return new Vector2(speed * Math.cos(rad), speed * Math.sin(rad));
  }

  projection(ontoVector) {
    const magSq = ontoVector.magnitudeSquared();
    if (magSq === 0) return Vector2.zero();
    const scale = this.dot(ontoVector) / magSq;
    return ontoVector.scale(scale);
  }

  perpendicular() {
    // Returns perpendicular vector (-y, x)
    return new Vector2(-this.y, this.x);
  }

  distance(v) {
    return this.sub(v).magnitude();
  }

  distanceSquared(v) {
    return this.sub(v).magnitudeSquared();
  }

  equals(v, epsilon = 1e-7) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}
