const _ = require('lodash');

module.exports = {
  theme: {
    extend: {},
    rotate: {
      '1/8': '45deg',
      '1/4': '90deg',
      '1/2': '180deg',
      '3/8': '135deg',
      '3/4': '270deg',
    },
  },
  variants: {},
  plugins: [
    function({ addUtilities, config, e }) {
      const rotateUtilities = _.map(config('theme.rotate'), (value, key) => {
        return {
          [`.${e(`rotate-${key}`)}`]: {
            transform: `rotate(${value})`,
          },
        };
      });
      addUtilities(rotateUtilities);
    },
  ],
};
