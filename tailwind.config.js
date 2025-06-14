module.exports = {
  content: ["./components/**/*.js", "./pages/**/*.js"],
  theme: {
    extend: {
      colors: {
        "accent-1": "#FAFAFA",
        "accent-2": "#EAEAEA",
        "accent-7": "#333",
        success: "#0070f3",
        cyan: "#79FFE1",
        // Modern tech-inspired palette
        "tech-dark": "#0f172a",
        "tech-slate": "#1e293b",
        "tech-blue": "#0ea5e9",
        "tech-purple": "#8b5cf6",
        "tech-teal": "#14b8a6",
        "tech-emerald": "#10b981",
        "tech-rose": "#f43f5e",
        "neon-blue": "#00d4ff",
        "neon-purple": "#a855f7",
        "neon-teal": "#2dd4bf",
      },
      spacing: {
        28: "7rem",
      },
      letterSpacing: {
        tighter: "-.04em",
      },
      lineHeight: {
        tight: 1.2,
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      boxShadow: {
        sm: "0 5px 10px rgba(0, 0, 0, 0.12)",
        md: "0 8px 30px rgba(0, 0, 0, 0.12)",
        // Enhanced shadows for more depth
        "glow-sm": "0 0 10px rgba(14, 165, 233, 0.15)",
        "glow-md": "0 0 20px rgba(14, 165, 233, 0.2)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.2)",
        "tech": "0 10px 40px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "tech-hover": "0 20px 60px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "blink": "blink 1s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(14, 165, 233, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.4)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0px)", opacity: "1" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
    },
  },
};
