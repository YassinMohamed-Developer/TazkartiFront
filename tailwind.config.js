/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#b90015",
        "primary-container": "#e21e26",
        "primary-fixed": "#ffdad6",
        "primary-fixed-dim": "#ffb4ac",
        "on-primary": "#ffffff",
        "on-primary-container": "#fff9f8",
        "on-primary-fixed": "#410003",
        "on-primary-fixed-variant": "#93000f",
        "inverse-primary": "#ffb4ac",
        
        "secondary": "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--color-secondary-container) / <alpha-value>)",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#636262",
        "on-secondary-fixed": "#1c1b1b",
        "on-secondary-fixed-variant": "#474746",

        "tertiary": "#00618d",
        "tertiary-container": "#007bb1",
        "tertiary-fixed": "#c9e6ff",
        "tertiary-fixed-dim": "#8aceff",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fafbff",
        "on-tertiary-fixed": "#001e2f",
        "on-tertiary-fixed-variant": "#004b6f",

        "background": "rgb(var(--color-background) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",

        "surface": "rgb(var(--color-surface) / <alpha-value>)",
        "surface-bright": "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-dim": "rgb(var(--color-surface-dim) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        "surface-dark": "#121212",
        "surface-tint": "#c00017",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "inverse-surface": "rgb(var(--color-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--color-inverse-on-surface) / <alpha-value>)",

        "outline": "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "pitch-green": "#1DA95E",
        "status-success": "#1DA95E",
        "golden-gate": "#AF7928",
        "status-warning": "#AF7928"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "gutter": "16px",
        "max-width": "1280px",
        "base": "8px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "body-md": ["Montserrat", "sans-serif"],
        "body-lg": ["Montserrat", "sans-serif"],
        "label-sm": ["IBM Plex Sans", "sans-serif"],
        "display-lg-mobile": ["Montserrat", "sans-serif"],
        "display-lg": ["Montserrat", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "display-lg-mobile": ["36px", { "lineHeight": "44px", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
}
