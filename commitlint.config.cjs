/**
 * Conventional Commits — https://www.conventionalcommits.org
 * Enforced by the commit-msg git hook (.husky/commit-msg) and in CI.
 *
 * Format:  type(scope): subject
 * Example: feat(frontend): add NFC tag read helper
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'root',
        'frontend',
        'backend',
        'ml',
        'api-types',
        'ci',
        'deps',
        'docs',
        'release',
        'security',
      ],
    ],
    // Allow longer explanatory commit bodies (e.g. pasted logs)
    'body-max-line-length': [0, 'always', Infinity],
    'footer-max-line-length': [0, 'always', Infinity],
  },
};
