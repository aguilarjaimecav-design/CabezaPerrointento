import { useCallback, useRef } from 'react';

let flyIdCounter = 0;

export function flyToCart(originEl: HTMLElement, imageSrc: string) {
  const cartIcon = document.querySelector('[aria-label="Carrito"]') as HTMLElement | null;
  if (!cartIcon) return;

  const originRect = originEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyEl = document.createElement('div');
  flyEl.className = 'fly-to-cart';
  flyEl.id = `fly-to-cart-${flyIdCounter++}`;

  const startX = originRect.left + originRect.width / 2 - 40;
  const startY = originRect.top + originRect.height / 2 - 40;
  const endX = cartRect.left + cartRect.width / 2 - 30;
  const endY = cartRect.top + cartRect.height / 2 - 30;

  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;

  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = '';
  flyEl.appendChild(img);

  document.body.appendChild(flyEl);

  flyEl.getBoundingClientRect();

  flyEl.style.transition = 'left 0.6s cubic-bezier(0.5, -0.2, 0.5, 1.2), top 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.5, -0.2, 0.5, 1.2), opacity 0.15s ease-in 0.5s';
  flyEl.style.left = `${endX}px`;
  flyEl.style.top = `${endY}px`;
  flyEl.style.transform = 'scale(0.2) rotate(15deg)';
  flyEl.style.opacity = '0';

  setTimeout(() => {
    flyEl.remove();
    cartIcon.classList.add('cart-bounce-pulse');
    setTimeout(() => cartIcon.classList.remove('cart-bounce-pulse'), 400);
  }, 650);
}

export function useFlyToCart() {
  const ref = useRef<HTMLElement | null>(null);
  const fly = useCallback((imageSrc: string) => {
    if (ref.current) {
      flyToCart(ref.current, imageSrc);
    } else {
      // fallback: use the event target's closest article/card
    }
  }, []);
  return { ref, fly };
}
