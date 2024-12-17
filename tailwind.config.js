
import { nextui } from "@nextui-org/react";
export default {
  content: [
    "./index.html",
    './src/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1F363D",
        white: "#FFFFFF",
        black: "#000000",
        cyan: {
          50: "#e6f1fe",
          100: "#cce3fd",
          200: "#99c7fb",
          300: "#66aaf9",
          400: "#338ef7",
          500: "#006FEE",
          600: "#005bc4",
          700: "#004493",
          800: "#002e62",
          900: "#001731",
        },
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "nextui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {
        spacingUnit: 4,
        disabledOpacity: 0.5,
        dividerWeight: "1px",
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem",
          small: "1.25rem",
          medium: "1.5rem",
          large: "1.75rem",
        },
        radius: {
          small: "8px",
          medium: "12px",
          large: "14px",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
      themes: {
        light: {
          layout: {
            hoverOpacity: 0.8,
            boxShadow: {
              small: "0px 0px 5px 0px rgb(0 0 0 / 0.02)",
              medium: "0px 0px 15px 0px rgb(0 0 0 / 0.03)",
              large: "0px 0px 30px 0px rgb(0 0 0 / 0.04)",
            },
          },
          colors: {
            foreground: "#000000",
          },
        },
        dark: {
          layout: {
            hoverOpacity: 0.9,
            boxShadow: {
              small: "0px 0px 5px 0px rgb(0 0 0 / 0.05)",
              medium: "0px 0px 15px 0px rgb(0 0 0 / 0.06)",
              large: "0px 0px 30px 0px rgb(0 0 0 / 0.07)",
            },
          },
          colors: {
            foreground: "#FFFFFF",
            white: "#FFFFFF",
            black: "#000000",
            cyan: {
              50: "#e6f1fe",
              100: "#cce3fd",
              200: "#99c7fb",
              300: "#66aaf9",
              400: "#338ef7",
              500: "#006FEE",
              600: "#005bc4",
              700: "#004493",
              800: "#002e62",
              900: "#001731",
            },
          },
        },
      },
    }),
  ],
};
