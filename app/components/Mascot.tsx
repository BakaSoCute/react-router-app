import s from "./Mascot.module.css";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Mascot({ className, size = "md" }: Props) {
  return (
    <div className={`${s.wrap} ${s[size]} ${className ?? ""}`} aria-hidden="true">
      <svg className={s.svg} viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6ec7" />
            <stop offset="100%" stopColor="#b44aff" />
          </linearGradient>
          <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#b44aff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hair back */}
        <ellipse cx="100" cy="95" rx="72" ry="78" fill="url(#hairGrad)" opacity="0.85" />

        {/* Face */}
        <ellipse cx="100" cy="108" rx="58" ry="62" fill="#ffe8f5" />

        {/* Blush */}
        <ellipse cx="68" cy="118" rx="12" ry="7" fill="#ff6ec7" opacity="0.35" />
        <ellipse cx="132" cy="118" rx="12" ry="7" fill="#ff6ec7" opacity="0.35" />

        {/* Eyes */}
        <ellipse cx="78" cy="105" rx="14" ry="16" fill="#1a0a2e" />
        <ellipse cx="122" cy="105" rx="14" ry="16" fill="#1a0a2e" />
        <ellipse cx="80" cy="103" rx="8" ry="10" fill="url(#eyeGrad)" />
        <ellipse cx="124" cy="103" rx="8" ry="10" fill="url(#eyeGrad)" />
        <circle cx="83" cy="100" r="3" fill="#fff" />
        <circle cx="127" cy="100" r="3" fill="#fff" />

        {/* Tsundere pout */}
        <path d="M88 128 Q100 122 112 128" stroke="#ff6ec7" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Hair front / twintails */}
        <path
          d="M38 80 Q30 140 42 190 Q55 160 50 100 Q45 60 38 80"
          fill="url(#hairGrad)"
          filter="url(#glow)"
        />
        <path
          d="M162 80 Q170 140 158 190 Q145 160 150 100 Q155 60 162 80"
          fill="url(#hairGrad)"
          filter="url(#glow)"
        />
        <path
          d="M55 55 Q100 20 145 55 Q130 75 100 70 Q70 75 55 55"
          fill="url(#hairGrad)"
        />

        {/* Hair bow */}
        <circle cx="100" cy="48" r="8" fill="#00f5ff" opacity="0.9" />
        <path d="M88 48 Q78 38 82 52 Q88 50 88 48" fill="#ff6ec7" />
        <path d="M112 48 Q122 38 118 52 Q112 50 112 48" fill="#ff6ec7" />

        {/* Body hint */}
        <path d="M65 168 Q100 185 135 168 L130 220 Q100 230 70 220 Z" fill="#1a0a3e" opacity="0.7" />
        <path d="M80 175 L100 195 L120 175" stroke="#ff6ec7" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
      <span className={s.sparkle1}>✦</span>
      <span className={s.sparkle2}>✧</span>
      <span className={s.sparkle3}>✦</span>
    </div>
  );
}
