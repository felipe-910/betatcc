// Ilustrações da tela de histórias, feitas em SVG: assim ficam nítidas em qualquer tamanho
// (celular, tablet ou computador) e não dependem de uma imagem de fundo com proporção fixa.

export function Sol() {
  const raios = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <g stroke="#ffab2e" strokeWidth="8" strokeLinecap="round">
        {raios.map((a) => (
          <line key={a} x1="60" y1="9" x2="60" y2="19" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="31" fill="#ffb13b" />
      <circle cx="60" cy="60" r="31" fill="url(#solBrilho)" />
      <defs>
        <radialGradient id="solBrilho" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#ffd36b" stopOpacity=".9" />
          <stop offset="1" stopColor="#ff9f1c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="56" r="3.4" fill="#5b3a1d" />
      <circle cx="70" cy="56" r="3.4" fill="#5b3a1d" />
      <circle cx="44" cy="65" r="5" fill="#ff8f6b" opacity=".55" />
      <circle cx="76" cy="65" r="5" fill="#ff8f6b" opacity=".55" />
      <path d="M52 66 Q60 74 68 66" fill="none" stroke="#5b3a1d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Nuvem() {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <path
        d="M24 58c-13 0-22-8-22-19 0-10 8-18 19-18 3-12 13-20 26-20 14 0 25 8 28 20 14-1 25 8 25 20 0 10-9 17-21 17z"
        transform="translate(4 0) scale(.93 .93)"
        fill="#fff"
      />
    </svg>
  );
}

// Colinas com a cachoeira no meio
export function Colinas() {
  return (
    <svg viewBox="0 0 420 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="colinaEsc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb487" />
          <stop offset="1" stopColor="#52c096" />
        </linearGradient>
        <linearGradient id="colinaMeio" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#37a97f" />
          <stop offset="1" stopColor="#47b88c" />
        </linearGradient>
        <linearGradient id="agua" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9ecf7" />
          <stop offset="1" stopColor="#8fd8ec" />
        </linearGradient>
      </defs>
      {/* colina grande da esquerda */}
      <path d="M12 150C28 96 78 52 132 52c52 0 92 44 110 98z" fill="url(#colinaEsc)" />
      {/* colina de trás, onde nasce a cachoeira */}
      <path d="M96 150c8-62 46-104 92-104 40 0 70 40 78 104z" fill="url(#colinaMeio)" />
      {/* colina da direita */}
      <path d="M200 150C206 92 246 44 292 44c44 0 76 44 84 106z" fill="url(#colinaEsc)" />
      {/* colina pequena, mais clara */}
      <path d="M296 150c4-34 24-62 48-62s42 28 46 62z" fill="#8fd68f" />
      {/* cachoeira */}
      <path d="M176 36c14-6 38-6 54 4 4 22 6 62 8 110h-44c-2-46-8-86-18-114z" fill="url(#agua)" />
      <path d="M196 36c4 32 8 74 12 114" stroke="#e8fafd" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M214 42c3 26 6 66 8 108" stroke="#d3f3fa" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".8" />
      {/* espuma na base */}
      <ellipse cx="206" cy="146" rx="42" ry="9" fill="#9fe0f1" />
      <ellipse cx="190" cy="145" rx="16" ry="6" fill="#d8f6fb" />
      <ellipse cx="224" cy="146" rx="18" ry="6" fill="#d8f6fb" />
    </svg>
  );
}

// Moita de folhas (usada nos dois cantos; no canto direito ela é espelhada pelo CSS)
export function Arbusto() {
  return (
    <svg viewBox="0 0 160 130" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="folhaClara" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fdc73" />
          <stop offset="1" stopColor="#4cbf62" />
        </linearGradient>
        <linearGradient id="folhaEscura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb55d" />
          <stop offset="1" stopColor="#2a9a52" />
        </linearGradient>
      </defs>
      <path d="M0 130V58C0 34 14 18 34 18c18 0 30 16 30 38 0 22-6 52-18 74z" fill="url(#folhaClara)" />
      <path d="M36 130c-6-28-4-58 14-76 14-14 38-14 50 0 12 14 10 40 2 76z" fill="url(#folhaEscura)" />
      <path d="M86 130c0-26 8-48 26-58 16-8 34 2 38 22 2 12 0 24-4 36z" fill="url(#folhaClara)" />
      <path d="M52 130c-2-22 2-44 12-58" stroke="#2a9a52" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="M104 126c-2-18 2-34 12-46" stroke="#2f9f58" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5" />
      <path d="M22 120c-4-22-2-44 6-62" stroke="#3fb55d" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5" />
    </svg>
  );
}
