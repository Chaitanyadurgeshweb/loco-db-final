module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Command Center tokens
        canvas: "#011523", surface: "#061a29", elevated: "#0c2438", recessed: "#00101c", line: "#1e3a5f",
        accent: { DEFAULT: "#2878D0", 600: "#1D63B2" },
        navy: { DEFAULT: "#10243A", 800: "#183B5B", 50: "#0c2438" },
        rail: "#B91C1C",
        // The existing code uses the gray scale for light-on-white; it is remapped here so every page follows the dark theme.
        gray: { 50: "#061a29", 100: "#0c2438", 200: "#1e3a5f", 300: "#2a4a70", 400: "#8195AB", 500: "#8497AD", 600: "#94A3B8", 700: "#AEBBCB", 800: "#CBD5E1", 900: "#F1F5F9" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { industrial: "6px", card: "8px" },
    },
  },
  plugins: [],
};
