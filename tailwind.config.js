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
        // Enhanced jazzy colors
        "electric-lime": "#ccff00",
        "hot-pink": "#ff1493",
        "neon-orange": "#ff4500",
        "cyber-yellow": "#ffff00",
        "plasma-blue": "#0080ff",
        "electric-purple": "#bf00ff",
        "neon-green": "#39ff14",
        "laser-red": "#ff073a",
        "voltage-blue": "#0040ff",
        "acid-green": "#b0ff00",
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
        // Jazzy enhanced shadows
        "electric": "0 0 30px rgba(255, 255, 0, 0.6), 0 0 60px rgba(255, 20, 147, 0.4)",
        "neon-rainbow": "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3), 0 0 60px rgba(255, 255, 0, 0.2)",
        "cyber-glow": "0 0 25px rgba(204, 255, 0, 0.7), 0 0 50px rgba(255, 20, 147, 0.5)",
        "plasma": "0 0 35px rgba(0, 128, 255, 0.8), 0 0 70px rgba(191, 0, 255, 0.6)",
        "laser": "0 0 40px rgba(255, 7, 58, 0.9), 0 0 80px rgba(255, 69, 0, 0.7)",
        "voltage": "0 0 15px rgba(0, 64, 255, 0.6), 0 0 30px rgba(57, 255, 20, 0.4), 0 0 45px rgba(255, 255, 0, 0.3)",
        "multi-glow": "0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(20, 184, 166, 0.2)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "blink": "blink 1s ease-in-out infinite",
        // Enhanced jazzy animations
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 8s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "rainbow": "rainbow 3s ease-in-out infinite",
        "electric": "electric 2s ease-in-out infinite alternate",
        "wave": "wave 2.5s ease-in-out infinite",
        "glitch": "glitch 0.3s infinite",
        "neon-glow": "neonGlow 2s ease-in-out infinite alternate",
        "color-shift": "colorShift 4s ease-in-out infinite",
        "scale-pulse": "scalePulse 2s ease-in-out infinite",
        "rotate-glow": "rotateGlow 6s linear infinite",
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
        // Enhanced jazzy keyframes
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        rainbow: {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        electric: {
          "0%": { 
            boxShadow: "0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 20, 147, 0.4)",
            filter: "brightness(1.2)"
          },
          "100%": { 
            boxShadow: "0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(255, 20, 147, 0.6)",
            filter: "brightness(1.5)"
          },
        },
        wave: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
        glitch: {
          "0%, 100%": { 
            transform: "translate(0)",
            filter: "hue-rotate(0deg)"
          },
          "20%": { 
            transform: "translate(-2px, 2px)",
            filter: "hue-rotate(90deg)"
          },
          "40%": { 
            transform: "translate(-2px, -2px)",
            filter: "hue-rotate(180deg)"
          },
          "60%": { 
            transform: "translate(2px, 2px)",
            filter: "hue-rotate(270deg)"
          },
          "80%": { 
            transform: "translate(2px, -2px)",
            filter: "hue-rotate(45deg)"
          },
        },
        neonGlow: {
          "0%": { 
            textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
          "100%": { 
            textShadow: "0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor, 0 0 50px currentColor",
          },
        },
        colorShift: {
          "0%": { color: "#00d4ff" },
          "25%": { color: "#ff1493" },
          "50%": { color: "#ccff00" },
          "75%": { color: "#a855f7" },
          "100%": { color: "#00d4ff" },
        },
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        rotateGlow: {
          "0%": { 
            transform: "rotate(0deg)",
            filter: "hue-rotate(0deg) brightness(1)"
          },
          "100%": { 
            transform: "rotate(360deg)",
            filter: "hue-rotate(360deg) brightness(1.2)"
          },
        },
      },
    },
  },
};
