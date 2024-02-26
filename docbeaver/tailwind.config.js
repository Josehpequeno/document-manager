// tailwind.config.js

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Arquivos nos quais o Tailwind deve procurar classes não utilizadas
  darkMode: false, // ou 'media' ou 'class' - Ativa o modo escuro
  theme: {
    extend: {
      colors: {
        primary: '#E1D100', // Define uma cor personalizada chamada 'primary'
        secundary: '#CE460B'
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Define fontes personalizadas
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'], // Adiciona variantes estendidas para opacidade
    },
  },
  plugins: [],
}
