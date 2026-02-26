import React from "react";

interface LogoProps {
  variant?: "full" | "compact" | "icon";
  theme?: "dark" | "light";
  className?: string;
  width?: number;
}

/**
 * Logo Espressamente Coffee
 * - variant="full": logo completo con chicchi + testo (default)
 * - variant="compact": versione orizzontale per navbar
 * - variant="icon": solo chicco singolo (favicon/mobile)
 * - theme="dark": testo scuro su sfondo chiaro (default)
 * - theme="light": testo bianco su sfondo scuro
 */
export function Logo({
  variant = "compact",
  theme = "dark",
  className = "",
  width,
}: LogoProps) {
  const textColor = theme === "dark" ? "#2C1810" : "#FFFFFF";
  const subtitleColor = theme === "dark" ? "#5C3D2E" : "#C8956C";
  const beanColor = theme === "dark" ? "#2C1810" : "#FFFFFF";
  const beanLineColor = theme === "dark" ? "#F5EDE4" : "#2C1810";

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width={width ?? 40}
        aria-label="Espressamente Coffee"
      >
        <g transform="translate(20, 20) rotate(10)">
          <ellipse cx="0" cy="0" rx="12" ry="17" fill={beanColor} />
          <path
            d="M0,-15 C-3,-5 -3,5 0,15"
            stroke={beanLineColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }

  if (variant === "compact") {
    return (
      <svg
        viewBox="0 0 280 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width={width ?? 220}
        aria-label="Espressamente Coffee"
      >
        {/* Single coffee bean */}
        <g transform="translate(18, 25) rotate(10)" opacity="0.85">
          <ellipse cx="0" cy="0" rx="10" ry="15" fill={beanColor} />
          <path
            d="M0,-13 C-2,-4 -2,4 0,13"
            stroke={beanLineColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        <text
          x="40"
          y="28"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontSize="26"
          fontWeight="700"
          fill={textColor}
          letterSpacing="-0.3"
        >
          espressamente
        </text>

        <text
          x="42"
          y="43"
          fontFamily="'Helvetica Neue', 'Arial', sans-serif"
          fontSize="10"
          fontWeight="300"
          fill={subtitleColor}
          letterSpacing="5"
        >
          coffee
        </text>
      </svg>
    );
  }

  // Full logo
  return (
    <svg
      viewBox="0 0 400 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={width ?? 300}
      aria-label="Espressamente Coffee"
    >
      {/* Three coffee beans */}
      <g opacity="0.12">
        <g transform="translate(155, 50) rotate(-15)">
          <ellipse cx="0" cy="0" rx="22" ry="32" fill={beanColor} />
          <path
            d="M0,-30 C-4,-10 -4,10 0,30"
            stroke={beanLineColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(200, 42) rotate(5)">
          <ellipse cx="0" cy="0" rx="22" ry="32" fill={beanColor} />
          <path
            d="M0,-30 C-4,-10 -4,10 0,30"
            stroke={beanLineColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(245, 50) rotate(20)">
          <ellipse cx="0" cy="0" rx="22" ry="32" fill={beanColor} />
          <path
            d="M0,-30 C-4,-10 -4,10 0,30"
            stroke={beanLineColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>

      <text
        x="200"
        y="85"
        textAnchor="middle"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontSize="42"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.5"
      >
        espressamente
      </text>

      <text
        x="200"
        y="112"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', 'Arial', sans-serif"
        fontSize="16"
        fontWeight="300"
        fill={subtitleColor}
        letterSpacing="8"
      >
        coffee
      </text>
    </svg>
  );
}
