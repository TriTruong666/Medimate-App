/** @type {import('tailwindcss').Config} */
module.exports = {
  // Đã sửa lại để quét tất cả các file có đuôi js, jsx, ts, tsx trong thư mục app
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};