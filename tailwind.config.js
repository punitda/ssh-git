module.exports = {
  theme: {
    gradients: theme => ({
      'purple-black': [theme('colors.purple.800'), theme('colors.gray.900')],
    }),
    extend: {
      colors: {
        'steel-gray': '#758CAC',
      },
    },
  },
  variants: {
    borderWidth: ['responsive', 'hover', 'focus']
  },
  plugins: [require('./plugins/gradients')],
};
