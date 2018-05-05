module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
  },
  rules: {
    // turn off newline after import(require)
    'import/newline-after-import': ['off'],

    // Exception just for _id (MongoDB default Index)
    'no-underscore-dangle': ['error', { allow: ['_id'] }],

    // allow param-reassign only in props
    'no-param-reassign': ['error', { props: false }],

    // Enable console output because Node.js.
    'no-console': ['off'],
  },
};
