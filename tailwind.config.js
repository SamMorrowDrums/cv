module.exports = {
  content: ["./components/**/*.js", "./pages/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Clean, minimal color palette
        "primary": "#1a1a1a",
        "secondary": "#6b7280",
        "accent": "#2563eb",
        "accent-hover": "#1d4ed8",
        "surface": "#ffffff",
        "surface-alt": "#f9fafb",
        "border": "#e5e7eb",
        // Dark mode colors
        "dark-primary": "#f9fafb",
        "dark-secondary": "#9ca3af",
        "dark-accent": "#60a5fa",
        "dark-accent-hover": "#93c5fd",
        "dark-surface": "#0a0a0a",
        "dark-surface-alt": "#171717",
        "dark-border": "#262626",
      },
      spacing: {
        28: "7rem",
      },
      letterSpacing: {
        tighter: "-.04em",
      },
      lineHeight: {
        tight: 1.2,
        relaxed: 1.75,
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            lineHeight: '1.75',
          },
        },
      },
    },
  },
};
