/**
 * Development Utilities for Zanwik Dashboard
 * Following cursor rules for consistent and efficient development
 */

const fs = require('fs');
const path = require('path');

/**
 * Creates a new React component following our conventions
 * @param {string} componentName - PascalCase component name
 * @param {string} directory - Target directory
 * @param {boolean} withTypeScript - Whether to use TypeScript
 */
function createReactComponent(componentName, directory = 'src/components', withTypeScript = true) {
  const ext = withTypeScript ? 'tsx' : 'jsx';
  const componentContent = `import React from 'react';
${withTypeScript ? `import { FC } from 'react';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: FC<${componentName}Props> = ({}) => {
  return (
    <div className="${componentName.toLowerCase()}-container">
      <h2>${componentName}</h2>
    </div>
  );
};

export default ${componentName};` : `const ${componentName} = () => {
  return (
    <div className="${componentName.toLowerCase()}-container">
      <h2>${componentName}</h2>
    </div>
  );
};

export default ${componentName};`}`;

  const filePath = path.join(directory, `${componentName}.${ext}`);
  
  // Ensure directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  fs.writeFileSync(filePath, componentContent);
  console.log(`✅ Created ${componentName} component at ${filePath}`);
}

/**
 * Creates a custom hook following our conventions
 * @param {string} hookName - camelCase hook name
 * @param {string} directory - Target directory
 */
function createCustomHook(hookName, directory = 'src/hooks') {
  const hookContent = `import { useState, useEffect } from 'react';

/**
 * ${hookName} - Custom hook for ${hookName.replace(/([A-Z])/g, ' $1').toLowerCase()}
 * @returns {Object} Hook state and methods
 */
export const use${hookName.charAt(0).toUpperCase() + hookName.slice(1)} = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add your hook logic here
  }, []);

  return {
    state,
    loading,
    error,
    // Add your methods here
  };
};`;

  // Remove "use" prefix if it already exists in the hookName
  const fileName = hookName.startsWith('use') ? hookName : `use${hookName.charAt(0).toUpperCase() + hookName.slice(1)}`;
  const filePath = path.join(directory, `${fileName}.js`);
  
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  fs.writeFileSync(filePath, hookContent);
  console.log(`✅ Created ${hookName} hook at ${filePath}`);
}

/**
 * Creates an API service following our conventions
 * @param {string} serviceName - camelCase service name
 * @param {string} directory - Target directory
 */
function createApiService(serviceName, directory = 'src/services') {
  const serviceContent = `/**
 * ${serviceName} API Service
 * Handles all ${serviceName} related API calls
 */

import api from '../utils/api';

export const ${serviceName}Service = {
  /**
   * Get all ${serviceName} items
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} ${serviceName} items
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get(\`/${serviceName}\`, { params });
      return response.data;
    } catch (error) {
      console.error(\`Error fetching ${serviceName}:\`, error);
      throw error;
    }
  },

  /**
   * Get single ${serviceName} item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} ${serviceName} item
   */
  getById: async (id) => {
    try {
      const response = await api.get(\`/${serviceName}/\${id}\`);
      return response.data;
    } catch (error) {
      console.error(\`Error fetching ${serviceName} by ID:\`, error);
      throw error;
    }
  },

  /**
   * Create new ${serviceName} item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} Created item
   */
  create: async (data) => {
    try {
      const response = await api.post(\`/${serviceName}\`, data);
      return response.data;
    } catch (error) {
      console.error(\`Error creating ${serviceName}:\`, error);
      throw error;
    }
  },

  /**
   * Update ${serviceName} item
   * @param {string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated item
   */
  update: async (id, data) => {
    try {
      const response = await api.put(\`/${serviceName}/\${id}\`, data);
      return response.data;
    } catch (error) {
      console.error(\`Error updating ${serviceName}:\`, error);
      throw error;
    }
  },

  /**
   * Delete ${serviceName} item
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(\`/${serviceName}/\${id}\`);
    } catch (error) {
      console.error(\`Error deleting ${serviceName}:\`, error);
      throw error;
    }
  },
};

export default ${serviceName}Service;`;

  const filePath = path.join(directory, `${serviceName}Service.js`);
  
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  fs.writeFileSync(filePath, serviceContent);
  console.log(`✅ Created ${serviceName} service at ${filePath}`);
}

/**
 * Validates code against our cursor rules
 * @param {string} filePath - Path to the file to validate
 */
function validateCode(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for unused imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g;
  const imports = [...content.matchAll(importRegex)].map(match => match[1].split(',').map(i => i.trim()));
  
  // Check for meaningful variable names
  const variableRegex = /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const variables = [...content.matchAll(variableRegex)].map(match => match[2]);
  
  // Check for proper error handling
  if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
    issues.push('Async functions should have proper error handling');
  }

  // Check for JSDoc comments on complex functions
  const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const functions = [...content.matchAll(functionRegex)].map(match => match[1]);
  
  if (issues.length > 0) {
    console.log(`⚠️  Issues found in ${filePath}:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`✅ ${filePath} follows cursor rules`);
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const name = args[1];

  if (!command) {
    console.log('Usage: node dev-utils.js <command> <name>');
    console.log('Commands:');
    console.log('  component <name> - Create a new React component');
    console.log('  hook <name> - Create a new custom hook');
    console.log('  service <name> - Create a new API service');
    console.log('  validate <file> - Validate a file against cursor rules');
    return;
  }

  if (!name) {
    console.log('Error: Name is required');
    return;
  }

  switch (command) {
    case 'component':
      createReactComponent(name);
      break;
    case 'hook':
      createCustomHook(name);
      break;
    case 'service':
      createApiService(name);
      break;
    case 'validate':
      validateCode(name);
      break;
    default:
      console.log(`Unknown command: ${command}`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createReactComponent,
  createCustomHook,
  createApiService,
  validateCode,
}; 