export default function WheelFallback() {
  return (
    <div
      className="wheel-fallback"
      role="img"
      aria-label="Иллюстрация автомобильного колеса"
    >
      <svg viewBox="0 0 500 500" aria-hidden="true">
        <defs>
          <radialGradient id="rubber">
            <stop stopColor="#303539" />
            <stop offset=".75" stopColor="#161a1d" />
            <stop offset="1" stopColor="#4b5053" />
          </radialGradient>
          <linearGradient id="metal">
            <stop stopColor="#e5e8e8" />
            <stop offset=".45" stopColor="#6a757a" />
            <stop offset=".65" stopColor="#c9d0d3" />
            <stop offset="1" stopColor="#525d62" />
          </linearGradient>
        </defs>
        <circle
          cx="250"
          cy="250"
          r="195"
          fill="url(#rubber)"
          stroke="#090b0d"
          strokeWidth="18"
        />
        <circle
          cx="250"
          cy="250"
          r="139"
          fill="#22282c"
          stroke="url(#metal)"
          strokeWidth="13"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d="M242 240 230 113 247 112 263 246Z"
            fill="url(#metal)"
            transform={`rotate(${i * 36} 250 250)`}
          />
        ))}
        <circle cx="250" cy="250" r="35" fill="url(#metal)" />
        <circle cx="250" cy="250" r="19" fill="#202528" />
        {Array.from({ length: 5 }, (_, i) => (
          <circle
            key={i}
            cx="250"
            cy="223"
            r="4"
            fill="#202528"
            transform={`rotate(${i * 72} 250 250)`}
          />
        ))}
      </svg>
    </div>
  );
}
