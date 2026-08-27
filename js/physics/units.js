/**
 * Physics units helper functions
 */
export const Units = {
  radToDeg(rad) {
    return (rad * 180) / Math.PI;
  },

  degToRad(deg) {
    return (deg * Math.PI) / 180;
  },

  polarToCartesian(speed, angleDeg) {
    const rad = Units.degToRad(angleDeg);
    return {
      vx: speed * Math.cos(rad),
      vy: speed * Math.sin(rad)
    };
  },

  cartesianToPolar(vx, vy) {
    const speed = Math.hypot(vx, vy);
    let angleRad = Math.atan2(vy, vx);
    let angleDeg = Units.radToDeg(angleRad);
    if (angleDeg < 0) angleDeg += 360; // Keep angle positive 0-360 if preferred or keep -180 to 180
    return {
      speed: speed,
      angleDeg: angleDeg
    };
  },

  formatVal(val, decimals = 2) {
    if (val === undefined || val === null || isNaN(val)) return '--';
    if (Math.abs(val) < 1e-6) return '0.00';
    return val.toFixed(decimals);
  }
};
