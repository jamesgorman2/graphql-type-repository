module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'babel',
  ],
  rules: {
    "linebreak-style": 0,
    'babel/func-params-comma-dangle': ['error', 'always-multiline'],
    'import/prefer-default-export': 0,
    "no-use-before-define": ["error", { "functions": false, "classes": false }]
  },
};
