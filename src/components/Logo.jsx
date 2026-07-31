export default function Logo({ variant = 'light', className = '', width = 210 }) {
  const textFill = variant === 'dark' ? '#FFFFFF' : '#1E2640';

  return (
    <svg
      viewBox="0 0 240 52"
      fill="none"
      width={width}
      className={className}
      role="img"
      aria-label="MamaBuddy"
    >
      <circle cx="26" cy="26" r="22" stroke="#F2567A" strokeWidth="2.8" />
      <path
        d="M26 38C26 38 15 30.5 15 21.5C15 17.9 17.9 15 21.5 15C23.4 15 25.1 15.8 26 17.1C26.9 15.8 28.6 15 30.5 15C34.1 15 37 17.9 37 21.5C37 30.5 26 38 26 38Z"
        fill="#F2567A"
      />
      <text
        x="60"
        y="34"
        fontFamily="Fraunces, serif"
        fontSize="26"
        fontWeight="600"
        fill={textFill}
      >
        MamaBuddy
      </text>
    </svg>
  );
}
