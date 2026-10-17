export function triggerConfetti() {
  if (typeof document === 'undefined') return;

  const count = 40;
  const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const startY = window.innerHeight * 0.45;
    const velX = (Math.random() - 0.5) * 500;
    const velY = -300 - Math.random() * 400;

    el.style.position = 'fixed';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size * 0.7}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = '2px';
    el.style.zIndex = '99999';
    el.style.pointerEvents = 'none';
    el.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease-out';

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(${velX}px, ${velY + 800}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      el.remove();
    }, 1300);
  }
}
