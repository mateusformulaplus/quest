export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="blueCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#1e40af" />
    </linearGradient>
    <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="60%" stop-color="#16a34a" />
      <stop offset="100%" stop-color="#15803d" />
    </linearGradient>
    <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#84cc16" />
      <stop offset="100%" stop-color="#4d7c0f" />
    </linearGradient>
    <linearGradient id="orangePlusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <g transform="translate(15, 10)">
    <circle cx="70" cy="70" r="58" fill="url(#blueCircleGrad)" />
    <path d="M 70,110 C 48,110 32,94 32,72 C 32,54 44,38 60,30 C 52,44 50,62 60,78 C 70,94 88,100 102,90 C 108,84 110,74 108,65 C 109,72 108,80 104,87 C 96,102 83,110 70,110 Z" fill="#ffffff" opacity="0.9" />
    <path d="M 70,20 C 70,20 38,42 42,75 C 45,95 62,102 75,92 C 88,82 92,62 82,45 C 75,32 70,20 70,20 Z" fill="url(#leafGrad1)" />
    <path d="M 70,20 C 65,40 60,60 75,92" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M 75,22 C 85,28 108,42 102,68 C 98,82 82,88 72,80 C 65,74 68,60 76,48 C 82,38 75,22 75,22 Z" fill="url(#leafGrad2)" />
  </g>

  <g transform="translate(155, 30)">
    <text x="0" y="70" font-family="Arial, 'Helvetica Neue', sans-serif" font-weight="900" font-size="62" fill="#1e293b" letter-spacing="-1">
      FÓRMULA
    </text>
    <text x="295" y="70" font-family="Arial, 'Helvetica Neue', sans-serif" font-weight="700" font-size="50" fill="#1e293b" letter-spacing="-0.5">
      plus
    </text>
    <g transform="translate(388, 38)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="url(#orangePlusGrad)" />
      <path d="M 14,7 L 14,21 M 7,14 L 21,14" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
    </g>
  </g>
</svg>`;

export const LOGO_SVG_DATA_URL = 'data:image/svg+xml;base64,' + btoa(LOGO_SVG);
