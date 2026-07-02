/**
 * Recreated in-code vector artwork (no external asset file exists yet).
 * Every shape is drawn inline (no <defs>/<use> id references, no external
 * <img> src) so it renders identically in the Vite preview and inside the
 * Electron BrowserWindow, regardless of sandboxing/CSP. Swap for the official
 * vector files whenever they're delivered — the export API (props) stays the same.
 */

const HAND_COLORS = {
  blue: '#2159A6',
  navy: '#1B4C8C',
  green: '#1E8449',
  darkGreen: '#146C3B',
  red: '#D6432E',
  orange: '#F2A63C',
  magenta: '#C22D8B',
}

const HANDS = [
  { x: 110, y: 34, rotate: 0, scale: 1.2, color: HAND_COLORS.blue },
  { x: 74, y: 46, rotate: -22, scale: 1.0, color: HAND_COLORS.darkGreen },
  { x: 148, y: 46, rotate: 22, scale: 1.0, color: HAND_COLORS.green },
  { x: 44, y: 70, rotate: -38, scale: 1.0, color: HAND_COLORS.orange },
  { x: 180, y: 70, rotate: 38, scale: 1.0, color: HAND_COLORS.green },
  { x: 96, y: 60, rotate: -8, scale: 0.92, color: HAND_COLORS.red },
  { x: 128, y: 60, rotate: 8, scale: 0.92, color: HAND_COLORS.red },
  { x: 58, y: 100, rotate: -52, scale: 0.95, color: HAND_COLORS.blue },
  { x: 166, y: 100, rotate: 52, scale: 0.95, color: HAND_COLORS.navy },
  { x: 110, y: 92, rotate: 0, scale: 0.9, color: HAND_COLORS.magenta },
  { x: 138, y: 96, rotate: 18, scale: 0.88, color: HAND_COLORS.red },
  { x: 78, y: 96, rotate: -18, scale: 0.88, color: HAND_COLORS.orange },
  { x: 33, y: 108, rotate: -48, scale: 0.85, color: HAND_COLORS.red },
  { x: 191, y: 108, rotate: 48, scale: 0.85, color: HAND_COLORS.magenta },
]

const LEAVES = [
  { x: 95, y: 22, rotate: -10, color: HAND_COLORS.green },
  { x: 133, y: 20, rotate: 15, color: HAND_COLORS.orange },
  { x: 58, y: 52, rotate: -30, color: HAND_COLORS.green },
  { x: 168, y: 56, rotate: 30, color: HAND_COLORS.green },
  { x: 92, y: 108, rotate: 0, color: HAND_COLORS.green },
]

function Hand({ x, y, rotate, scale, color }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} fill={color}>
      <ellipse cx="0" cy="-18" rx="13" ry="16" />
      <rect x="-13" y="-46" width="6.4" height="24" rx="3.2" transform="rotate(-16 -9.8 -34)" />
      <rect x="-5" y="-52" width="6.4" height="28" rx="3.2" />
      <rect x="2.6" y="-52" width="6.4" height="28" rx="3.2" />
      <rect x="9.6" y="-46" width="6.4" height="24" rx="3.2" transform="rotate(16 12.8 -34)" />
      <rect x="-24" y="-18" width="6.4" height="20" rx="3.2" transform="rotate(-50 -20.8 -8)" />
    </g>
  )
}

function Leaf({ x, y, rotate, color }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx="7"
      ry="3.2"
      fill={color}
      transform={`rotate(${rotate} ${x} ${y})`}
    />
  )
}

export function TreeLogo({ className = 'h-28 w-40' }) {
  return (
    <svg
      viewBox="0 0 220 200"
      className={className}
      role="img"
      aria-label="Logotipo Menteios: árbol de manos con símbolo Psi"
    >
      {HANDS.map((hand, index) => (
        <Hand key={index} {...hand} />
      ))}

      {LEAVES.map((leaf, index) => (
        <Leaf key={index} {...leaf} />
      ))}

      <text
        x="110"
        y="192"
        textAnchor="middle"
        fontSize="105"
        fontWeight="600"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill="#5B3A29"
      >
        Ψ
      </text>
    </svg>
  )
}

export function MenteiosWordmark({ className = 'h-6 w-auto' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 60 40"
        className={className}
        role="img"
        aria-label="Icono Menteios"
      >
        <g fill="none" stroke="#1f6b71" strokeWidth="3" strokeLinecap="round">
          <path d="M4,32 C4,14 16,4 30,4 C44,4 54,14 54,28" />
          <path d="M14,34 C14,20 22,10 34,10 C44,10 50,18 52,26" />
        </g>
        <circle cx="4" cy="32" r="3" fill="#1f6b71" />
        <circle cx="14" cy="34" r="3" fill="#1f6b71" />
      </svg>
      <span className="text-base font-bold tracking-wide text-brand-700">
        MENTEIOS
      </span>
    </span>
  )
}
