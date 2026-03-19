/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F9F6FC",
          white: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#000000",
          text: "#FFFFFF",
        },
        card: {
          green: "#A3E6A1",
          purple: "#D9AEF6",
          orange: "#FFA07A",
          yellow: "#FFD700",
          blue: "#87CEFA",
        },
        nav: {
          bg: "#000000",
          active: "#FFFFFF",
          inactive: "#808080",
        },
      },
      fontFamily: {
        // Medimate Custom Fonts
        'space-thin': ["SpaceGrotesk_300Light"],
        'space-regular': ["SpaceGrotesk_400Regular"],
        'space-medium': ["SpaceGrotesk_500Medium"],
        'space-semibold': ["SpaceGrotesk_600SemiBold"],
        'space-bold': ["SpaceGrotesk_700Bold"],
        'zen': ["ZenTokyoZoo_400Regular"],
      },
      borderRadius: {
        card: "32px",
      },
    },
  },
  plugins: [],
};