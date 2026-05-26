/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #0A5C36)',
          hover: 'var(--color-primary-hover, #074327)',
          light: 'var(--color-primary-light, #eaf2ed)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #F4A261)',
          hover: 'var(--color-secondary-hover, #e78e47)',
          light: 'var(--color-secondary-light, #fef6ef)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #1D3557)',
          hover: 'var(--color-accent-hover, #12223a)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 1px 0 rgba(0, 0, 0, 0.04)',
        hover: '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
