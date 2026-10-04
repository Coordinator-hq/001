// Canvas Confetti & Victory Particle Engine

export function triggerConfetti(colors: string[] = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6', '#FBBF24']) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

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

  const particles: Particle[] = [];
  const particleCount = 140;

  for (let i = 0; i < particleCount; i++) {
    const isLeft = Math.random() < 0.5;
    const originX = isLeft ? width * 0.2 : width * 0.8;
    const originY = height * 0.45;

    particles.push({
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

  let animationFrameId: number;
  const startTime = Date.now();
  const duration = 4000;

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      return;
    }

    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.985; // air drag
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, 1 - (elapsed / duration) * 1.1);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // star/diamond
        ctx.beginPath();
        ctx.moveTo(0, -p.h);
        ctx.lineTo(p.w / 2, 0);
        ctx.lineTo(0, p.h);
        ctx.lineTo(-p.w / 2, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
