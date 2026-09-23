import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';

/*
 * Theme system
 * ------------
 * Every colour class used in the app (bg-white, text-gray-900, bg-green-100 …)
 * reads from a CSS variable, so light and dark mode are just two sets of
 * variable values. Pages don't need `dark:` classes.
 *
 *   --c-<family>-<shade>  backgrounds, borders, rings, placeholders
 *   --t-<family>-<shade>  text colours (separate so dark mode can lighten
 *                         text without also lightening hover backgrounds)
 *   --surface             bg-white (cards, panels)
 *   --canvas              page background
 *
 * Palette: warm stone neutrals with a single deep-green accent ("pine").
 * `blue` and `indigo` both map to pine so every accent in the app matches.
 */

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const pine = {
  50: '#f0f7f3',
  100: '#dcede3',
  200: '#bbdcc9',
  300: '#8dc3a5',
  400: '#5ba47e',
  500: '#3b8862',
  600: '#256d4c',
  700: '#1e583e',
  800: '#1a4733',
  900: '#163b2b',
  950: '#0b2118',
};

const FAMILIES = {
  gray: colors.stone,
  blue: pine,
  indigo: pine,
  green: colors.green,
  red: colors.red,
  yellow: colors.amber,
  purple: colors.violet,
};

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const cssVar = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix, family) =>
  Object.fromEntries(SHADES.map((s) => [s, cssVar(`${prefix}-${family}-${s}`)]));

// Dark mode gray ramp (backgrounds): low shades become dark surfaces.
const DARK_GRAY_BG = {
  50: '#22201e', 100: '#2a2826', 200: '#34312e', 300: '#433f3b', 400: '#57534e',
  500: '#78716c', 600: '#a8a29e', 700: '#d6d3d1', 800: '#e7e5e4', 900: '#f5f5f4', 950: '#fafaf9',
};
// Dark mode gray ramp (text): high shades become light text.
const DARK_GRAY_TEXT = {
  50: '#1c1917', 100: '#292524', 200: '#44403c', 300: '#57534e', 400: '#78716c',
  500: '#a39d98', 600: '#b9b3ae', 700: '#d6d3d1', 800: '#e7e5e4', 900: '#f5f5f4', 950: '#fafaf9',
};

function themeVariables() {
  const light = { '--surface': rgb('#ffffff'), '--canvas': rgb('#f7f6f3') };
  const dark = { '--surface': rgb('#1c1a18'), '--canvas': rgb('#151412') };

  for (const [family, palette] of Object.entries(FAMILIES)) {
    for (const s of SHADES) {
      light[`--c-${family}-${s}`] = rgb(palette[s]);
      light[`--t-${family}-${s}`] = rgb(palette[s]);
    }
    if (family === 'gray') {
      for (const s of SHADES) {
        dark[`--c-gray-${s}`] = rgb(DARK_GRAY_BG[s]);
        dark[`--t-gray-${s}`] = rgb(DARK_GRAY_TEXT[s]);
      }
      continue;
    }
    // Light tints (badges, soft buttons) become deep tints; strong shades stay.
    const darkBg = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600 };
    // Dark text on tints becomes light text.
    const darkText = { 500: 400, 600: 400, 700: 300, 800: 200, 900: 100, 950: 50 };
    for (const s of SHADES) {
      dark[`--c-${family}-${s}`] = rgb(palette[darkBg[s] ?? s]);
      dark[`--t-${family}-${s}`] = rgb(palette[darkText[s] ?? s]);
    }
  }
  return { light, dark };
}

const { light, dark } = themeVariables();

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // Small, consistent corner radius everywhere (no pill-shaped cards).
    borderRadius: {
      none: '0',
      sm: '3px',
      DEFAULT: '4px',
      md: '5px',
      lg: '6px',
      xl: '7px',
      '2xl': '8px',
      '3xl': '10px',
      full: '9999px',
    },
    // Flat surfaces: panels are separated by hairlines, not soft glows.
    boxShadow: {
      none: 'none',
      sm: '0 1px 0 0 rgb(0 0 0 / 0.02)',
      DEFAULT: '0 0 0 1px rgb(var(--c-gray-200))',
      md: '0 2px 8px -2px rgb(0 0 0 / 0.08)',
      lg: '0 6px 20px -4px rgb(0 0 0 / 0.12)',
      xl: '0 12px 32px -8px rgb(0 0 0 / 0.16)',
      '2xl': '0 20px 48px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ...Object.fromEntries(Object.keys(FAMILIES).map((f) => [f, scale('c', f)])),
        surface: cssVar('surface'),
        canvas: cssVar('canvas'),
      },
      textColor: Object.fromEntries(Object.keys(FAMILIES).map((f) => [f, scale('t', f)])),
      backgroundColor: { white: cssVar('surface') },
      ringOffsetColor: { white: cssVar('surface') },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': { ...light, colorScheme: 'light' },
        '.dark': { ...dark, colorScheme: 'dark' },
      });
    }),
  ],
};
