export default class Collision {
  static horizontal({
    minRotation = -10,
    maxRotation = 10,
    minDelay = 0.05,
    maxDelay = 0.25,
    minFriction = 0.35,
    maxFriction = 0.85,
    minXFactor = 0,
    maxXFactor = 0.15,
  } = {}) {
    const collision = new Collision(minRotation, maxRotation, minDelay, maxDelay, minFriction, maxFriction, minXFactor, maxXFactor);
    collision.swap = true;
    return collision;
  }

  static vertical({ 
    minRotation = -10,
    maxRotation = 10,
    minDelay = 0.05,
    maxDelay = 0.15,
    minFriction = 0.65,
    maxFriction = 0.85,
    minXFactor = 0,
    maxXFactor = 0.15,
  } = {}) {
    return new Collision(minRotation, maxRotation, minDelay, maxDelay, minFriction, maxFriction, minXFactor, maxXFactor);
  }

  constructor(MIN_ROTATION, MAX_ROTATION, MIN_DELAY, MAX_DELAY, MIN_FRICTION, MAX_FRICTION, MIN_XFACTOR, MAX_XFACTOR) {
    this.angle = Math.random() * (MAX_ROTATION - MIN_ROTATION) + MIN_ROTATION;
    this.delay = (Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    this.friction = (Math.random() * (MAX_FRICTION - MIN_FRICTION)) + MIN_FRICTION;
    this.xfactor = -((Math.random() * (MAX_XFACTOR - MIN_XFACTOR)) + MIN_XFACTOR) * this.angle / MAX_ROTATION;

    this.slideX = 0;
    this.slideY = 0;
    this.rotation = 0;
  }

  apply(scale, distance) {
    // rotate mostly before starting slide
    this.rotation = this.angle * Math.min(1, scale / (this.delay + 0.45));

    // then start sliding after the delay
    if (scale >= this.delay) {
      this.slideX = (distance - distance / scale * this.delay) * this.friction * this.xfactor;
      this.slideY = (distance - distance / scale * this.delay) * this.friction;
    } else {
      this.slideX = 0;
      this.slideY = 0;
    }

    if (this.swap) {
      [this.slideX, this.slideY] = [this.slideY, this.slideX];
    }

    return this;
  }

  merge(...others) {
    others = others.filter(x => x);
    if (!others.length) { return this }
    const [other, ...rest] = others;
    const merged = {
      slideX: this.slideX + other.slideX,
      slideY: this.slideY + other.slideY,
      rotation: this.rotation + other.rotation,
    }
    return Collision.prototype.merge.apply(merged, rest);
  }
}
