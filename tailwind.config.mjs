/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}", "./public/admin/*.html"],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0b1220",
          accent: "#3b82f6"
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
