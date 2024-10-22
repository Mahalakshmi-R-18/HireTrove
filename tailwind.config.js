module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'home-bg': "url('/src/images/home_bg.jpg')", 
      },
    },
    fontFamily: {
      'hero-font': ['Teko', 'sans-serif'],
    },
  },
  plugins: [],
}
