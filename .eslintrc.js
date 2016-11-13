module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'babel',
  ],
  rules: {
    "linebreak-style": 0,
    'babel/func-params-comma-dangle': ['error', 'always-multiline'],
  },
};
