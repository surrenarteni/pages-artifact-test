module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Temporarily disable this rule
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@next/next/no-assign-module-variable': 'off', // Temporarily disable this rule
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  };