// Canvas Confetti & Victory Particle Engine — Singleton Architecture

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

class ConfettiManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private duration: number = 3800;
  private lastTriggerTime: number = 0;

  private createParticles(colors: string[], count: number, width: number, height: number): Particle[] {
    const list: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() < 0.5;
      const originX = isLeft ? width * 0.2 : width * 0.8;
      const originY = height * 0.45;

      list.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 80,
        w: 8 + Math.random() * 8,
        h: 5 + Math.random() * 6,
        vx: (isLeft ? 1 : -1) * (Math.random() * 8 + 3) + (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 14 + 7),
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        shape: Math.random() > 0.7 ? 'circle' : Math.random() > 0.4 ? 'rect' : 'star'
      });
    }
    return list;
  }

  public trigger(colors: string[] = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6', '#FBBF24']) {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    // Throttle rapid re-triggers within 300ms to preserve frame budget
    if (now - this.lastTriggerTime < 300 && this.particles.length >= 160) {
      return;
    }
    this.lastTriggerTime = now;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Reuse existing singleton canvas if already present in DOM
    if (!this.canvas || !document.body.contains(this.canvas)) {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '99999';
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
    }

    if (!this.ctx || !this.canvas) return;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // If an animation is already running, inject a bounded burst of new particles (capped at 160 total)
    const newBurst = this.createParticles(colors, 90, width, height);
    this.particles = [...this.particles.slice(-70), ...newBurst];
    this.startTime = now;

    if (!this.animationFrameId) {
      this.render();
    }
  }

  private render = () => {
    if (!this.ctx || !this.canvas) return;

    const now = Date.now();
    const elapsed = now - this.startTime;

    if (elapsed > this.duration || this.particles.length === 0) {
      this.cleanup();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.985; // drag
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, 1 - (elapsed / this.duration) * 1.15);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.h);
        this.ctx.lineTo(p.w / 2, 0);
        this.ctx.lineTo(0, p.h);
        this.ctx.lineTo(-p.w / 2, 0);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    if (this.canvas && document.body.contains(this.canvas)) {
      document.body.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}

const confettiManager = new ConfettiManager();

export function triggerConfetti(colors?: string[]) {
  confettiManager.trigger(colors);
}
