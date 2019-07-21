module.exports = {
  theme: {
    gradients: theme => ({
      'purple-black': [theme('colors.purple.800'), theme('colors.gray.900')],
    }),
    extend: {},
  },
  variants: {},
  plugins: [require('./plugins/gradients')],
};
