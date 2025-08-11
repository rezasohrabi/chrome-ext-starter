export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow long lines in the commit body
    'body-max-line-length': [0],
  },
};
