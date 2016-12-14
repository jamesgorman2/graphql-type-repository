module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'babel',
  ],
  rules: {
    "no-await-in-loop": 0,
    "linebreak-style": 0,
    'comma-dangle': ['error', 'always-multiline'],
    'import/prefer-default-export': 0,
    "no-use-before-define": ["error", { "functions": false, "classes": false }]
  },
};
