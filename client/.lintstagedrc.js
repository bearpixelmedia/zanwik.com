module.exports = {
  // Lint and format JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Format CSS, JSON, and Markdown files
  '*.{css,scss,json,md,yml,yaml}': [
    'prettier --write',
  ],
}; 