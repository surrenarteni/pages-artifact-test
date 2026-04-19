// src/components/ArtifactRunner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ArtifactRunnerProps {
  filePath: string;
  className?: string;
}

export const ArtifactRunner: React.FC<ArtifactRunnerProps> = ({ filePath, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artifactHtml, setArtifactHtml] = useState<string>('');
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Function to process the artifact code for compatibility
/**
 * Ultimate TypeScript processor for Babel compatibility
 * Handles complex TypeScript constructs that would cause Babel to fail in-browser
 */
  /**
 * Final enhanced TypeScript processor for Babel compatibility
 * With additional syntax validation and error correction
 */
  function processArtifactCode(code: string): string {
    console.log('Processing artifact code with enhanced syntax validation...');
    
    try {
      // Track transformations for debugging
      const transformations = [];
      
      // Initial processing - handle the most complex patterns first
      
      // Step 1: Convert TypeScript JSX types to valid JSX
      // This handles cases like: <PlaneProps> to {/*PlaneProps*/}
      let processedCode = code.replace(
        /(<)([A-Z]\w+(?:\[\])?)(\s*(?:extends\s+[^{]+)?)>((?:\s|\n)*\{)/g,
        (match, openBracket, typeName, extension, content) => {
          // Only transform if it's a type, not a JSX component
          // We check if it's followed by an object literal
          if (content.trim().startsWith('{')) {
            transformations.push(`Converted TypeScript JSX type: ${typeName}`);
            return `{/*${typeName}*/} {`;
          }
          return match;
        }
      );
      
      // Step 2: Handle complex JSX props with TypeScript generics
      // This targets arrow functions with generics inside JSX props
      processedCode = processedCode.replace(
        /(\w+)=\{<([^>]+)>\(\(?(\w+)(?::\s*[^)]*)?\)?\s*=>\s*(?:{|\()/g,
        (match, propName, genericType, paramName) => {
          transformations.push(`Fixed complex JSX prop with generic: ${propName}={<${genericType}>...}`);
          return `${propName}={(${paramName}) => ${paramName}.hasOwnProperty ? (`;
        }
      );
      
      // Step 3: Handle JSX event handlers with TypeScript types
      processedCode = processedCode.replace(
        /(\w+)={\(\(?(\w+)(?::\s*[^)]+)?\)?\s*=>/g,
        (match, eventName, paramName) => {
          transformations.push(`Simplified JSX event handler: ${eventName}`);
          return `${eventName}={(${paramName}) =>`;
        }
      );
      
      // Step 4: Remove ALL TypeScript generic syntax
      // This is a more aggressive approach that catches all generic syntax
      processedCode = processedCode.replace(
        /<([^<>\/\s]+(?:<[^<>]+>[^<>]*)*)>/g,
        (match, content) => {
          // Don't transform HTML/JSX tags
          if (match.match(/^<\/?[a-z]/i)) return match;
          if (match.match(/^<\/?[A-Z][a-zA-Z]+\s/)) return match;
          
          transformations.push(`Removed TypeScript generic: ${match}`);
          return '/*TS*/';
        }
      );
      
      // Step 5: Clean up any TypeScript interfaces
      processedCode = processedCode.replace(
        /interface\s+(\w+)(?:<[^>]*>)?\s*(?:extends\s+[^{]+)?\s*\{[^}]*\}/gs, 
        (match, interfaceName) => {
          transformations.push(`Removed interface: ${interfaceName}`);
          return `// TypeScript interface ${interfaceName} removed`;
        }
      );
      
      // Step 6: Remove type declarations
      processedCode = processedCode.replace(
        /type\s+(\w+)(?:<[^>]*>)?\s*=\s*[^;]*;/g, 
        (match, typeName) => {
          transformations.push(`Removed type definition: ${typeName}`);
          return `// TypeScript type ${typeName} removed`;
        }
      );
      
      // Step 7: Handle imports
      processedCode = processedCode.replace(
        /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+\w+))?\s+from\s+['"][^'"]+['"];?/g, 
        match => {
          transformations.push(`Removed import: ${match.trim()}`);
          return `// ${match.trim()}`;
        }
      );
      
      // Step 8: Remove function parameter type annotations
      processedCode = processedCode.replace(
        /(\(\s*)([^()]*?)(\s*\))/g,
        (match, open, params, close) => {
          // Skip if already processed or not a parameter list
          if (!params.includes(':')) return match;
          
          // Remove type annotations from params
          const cleanParams = params.replace(/(\w+)\s*:\s*[^,)]+/g, '$1');
          transformations.push(`Cleaned function parameters`);
          return `${open}${cleanParams}${close}`;
        }
      );
      
      // Step 9: Remove function return type annotations
      processedCode = processedCode.replace(
        /(\)\s*):\s*([^{;=]+)(?=[{;=])/g,
        (match, params, returnType) => {
          transformations.push(`Removed function return type: ${returnType.trim()}`);
          return params;
        }
      );
      
      // Step 10: Remove variable type annotations
      processedCode = processedCode.replace(
        /(\b\w+)\s*:\s*([^=;,]+)(?=[=;,])/g,
        (match, varName, varType) => {
          // Don't replace object property definitions
          if (match.trim().startsWith('{')) return match;
          transformations.push(`Removed variable type annotation: ${varName}: ${varType}`);
          return varName;
        }
      );
      
      // Step 11: Remove type assertions
      processedCode = processedCode.replace(
        /\(\s*([\w.[\]]+)\s+as\s+[^)]+\)/g,
        (match, expr) => {
          transformations.push(`Removed type assertion: ${match}`);
          return expr;
        }
      );
      
      // Step 12: Handle React FC type annotations
      processedCode = processedCode.replace(
        /const\s+(\w+)(?:\s*:\s*React\.FC(?:<[^>]*>)?|\s*:\s*React\.FunctionComponent(?:<[^>]*>)?)\s*=\s*/g,
        (match, componentName) => {
          transformations.push(`Simplified React component declaration: ${componentName}`);
          return `const ${componentName} = `;
        }
      );
      
      // Step 13: Handle export statements
      processedCode = processedCode.replace(
        /export\s+default\s+(\w+)/g, 
        (match, componentName) => {
          transformations.push(`Handled default export: ${componentName}`);
          return `const default_export = ${componentName}; console.log('Default export component:', '${componentName}');`;
        }
      );
      
      processedCode = processedCode.replace(
        /export\s+(?:const|function|class|let|var)\s+(\w+)/g, 
        (match, exportName) => {
          transformations.push(`Handled named export: ${exportName}`);
          return `const ${exportName}`;  // or keep 'function' or 'class' as appropriate
        }
      );
      
      // Step 14: Auto-inject necessary globals and React hooks
      let preamble = '// Code processed for Babel compatibility\n';
      
      // Add React hooks
      if (processedCode.includes('useState(') && !processedCode.includes('const { useState')) {
        preamble += `const { useState, useEffect, useRef } = React;\n`;
        transformations.push('Added React hooks reference');
      }
      
      // Add common constants
      if (processedCode.includes('INITIAL_HEALTH') && !processedCode.includes('const INITIAL_HEALTH')) {
        preamble += `const INITIAL_HEALTH = 100;\n`;
        transformations.push('Added INITIAL_HEALTH constant');
      }
      
      // Step 15: Fix common syntax issues
      // Remove any empty destructuring assignments
      processedCode = processedCode.replace(/const\s*{\s*}\s*=\s*[^;]+;/g, '// Removed empty destructuring');

      // Step 16: Balance braces, brackets, and parentheses
      // This is a basic algorithm to ensure balanced delimiters
      let openBraces = 0;
      let openBrackets = 0;
      let openParens = 0;
      let fixedCode = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < processedCode.length; i++) {
        const char = processedCode[i];
        
        // Handle string literals
        if ((char === '"' || char === "'" || char === '`') && 
            (i === 0 || processedCode[i-1] !== '\\')) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        
        // Only count delimiters outside of strings
        if (!inString) {
          if (char === '{') openBraces++;
          else if (char === '}') {
            if (openBraces > 0) openBraces--;
            else {
              transformations.push(`Removed extra closing brace at position ${i}`);
              continue; // Skip this char
            }
          }
          else if (char === '[') openBrackets++;
          else if (char === ']') {
            if (openBrackets > 0) openBrackets--;
            else {
              transformations.push(`Removed extra closing bracket at position ${i}`);
              continue; // Skip this char
            }
          }
          else if (char === '(') openParens++;
          else if (char === ')') {
            if (openParens > 0) openParens--;
            else {
              transformations.push(`Removed extra closing parenthesis at position ${i}`);
              continue; // Skip this char
            }
          }
        }
        
        fixedCode += char;
      }
      
      // Add missing closing delimiters
      while (openBraces > 0) {
        fixedCode += '}';
        transformations.push('Added missing closing brace');
        openBraces--;
      }
      
      while (openBrackets > 0) {
        fixedCode += ']';
        transformations.push('Added missing closing bracket');
        openBrackets--;
      }
      
      while (openParens > 0) {
        fixedCode += ')';
        transformations.push('Added missing closing parenthesis');
        openParens--;
      }
      
      processedCode = fixedCode;
      
      // Add debug information about transformations
      const debugInfo = `
  // TypeScript transformations: ${transformations.length}
  // ${transformations.join('\n// ')}
  `;
      
      processedCode = preamble + debugInfo + '\n' + processedCode;
      
      // Final validation step: try to parse the code using Function
      try {
        new Function('React', 'useState', 'useEffect', 'useRef', processedCode);
        console.log('Processed code is syntactically valid JavaScript');
      } catch (parseError) {
        console.error('Syntax error in processed code:', parseError);
        transformations.push(`SYNTAX ERROR: ${parseError.message}`);
        
        // Add information about the syntax error to the code
        processedCode = `
  // WARNING: Syntax error in processed code
  // ${parseError.message}
  // The code below may not run correctly

  ${processedCode}`;
      }
      
      console.log('Code processing completed with', transformations.length, 'transformations');
      return processedCode;
    } catch (err) {
      console.error('Error processing artifact code:', err);
      // Return the original code with error information for debugging
      return `
  // ERROR PROCESSING TYPESCRIPT
  // ${err.toString()}
  // Original code preserved:

  ${code}
  `;
    }
  }

  useEffect(() => {
    // Fixed createHtmlTemplate function with proper try/catch formatting
    const createHtmlTemplate = (originalCode) => {
      return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Claude Artifact Viewer</title>
      
      <!-- Load React -->
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
      
      <!-- Load Tailwind CSS -->
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      
      <style>
        body { 
          font-family: system-ui, sans-serif; 
          padding: 0; 
          margin: 0; 
          background-color: #374151;
          color: white;
        }
        #root { 
          width: 100%; 
          height: 90vh; 
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .tabs {
          position: fixed;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          background: rgba(17, 24, 39, 0.7);
          border-radius: 8px;
          padding: 4px;
          z-index: 1000;
        }
        .tab {
          padding: 8px 16px;
          cursor: pointer;
          background: transparent;
          border: none;
          color: #bbb;
          border-radius: 4px;
          margin: 0 2px;
        }
        .tab.active {
          background: #3b82f6;
          color: white;
        }
        .panel {
          display: none;
          position: fixed;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1200px;
          height: 80vh;
          background: rgba(17, 24, 39, 0.95);
          border-radius: 8px;
          padding: 20px;
          overflow: auto;
          z-index: 999;
        }
        .panel.active {
          display: block;
        }
        .code {
          background: #1a202c;
          padding: 15px;
          border-radius: 6px;
          overflow: auto;
          font-family: monospace;
          font-size: 14px;
          white-space: pre;
          max-height: calc(80vh - 100px);
        }
        .error {
          background: #7f1d1d;
          color: #fecaca;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-family: monospace;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .btn {
          background: #1f2937;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .loading {
          text-align: center;
          font-size: 18px;
          color: #e5e7eb;
        }
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <!-- UI -->
      <div id="root">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading artifact...</p>
        </div>
      </div>
      
      <div class="tabs">
        <button class="tab active" onclick="showTab('component')">Component</button>
        <button class="tab" onclick="showTab('code')">Code</button>
        <button class="tab" onclick="showTab('errors')">Errors</button>
      </div>
      
      <div id="component-panel" class="panel active"></div>
      
      <div id="code-panel" class="panel">
        <div class="toolbar">
          <h3>Original Code</h3>
          <button class="btn" onclick="showTab('component')">Close</button>
        </div>
        <pre id="original-code" class="code"></pre>
      </div>
      
      <div id="errors-panel" class="panel">
        <div class="toolbar">
          <h3>Error Information</h3>
          <button class="btn" onclick="showTab('component')">Close</button>
        </div>
        <div id="error-container">No errors detected</div>
      </div>
      
      <!-- Setup Script -->
      <script>
        // Tab functionality
        function showTab(tabName) {
          // Hide all panels
          document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
          });
          
          // Deactivate all tabs
          document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
          });
          
          // Activate selected tab and panel
          document.getElementById(tabName + '-panel').classList.add('active');
          document.querySelector('.tab[onclick*="' + tabName + '"]').classList.add('active');
        }
        
        // Error handling
        function showError(title, error) {
          console.error(title, error);
          
          const errorContainer = document.getElementById('error-container');
          const errorHTML = \`
            <div class="error">
              <strong>\${title}</strong>
              <p>\${error.message || error}</p>
              <pre>\${error.stack || ''}</pre>
            </div>
          \`;
          errorContainer.innerHTML = errorHTML;
          
          // Show the errors panel
          showTab('errors');
          
          // Update component panel with error message
          const componentPanel = document.getElementById('component-panel');
          componentPanel.innerHTML = \`
            <div style="max-width: 600px; margin: 0 auto; text-align: center;">
              <h2 style="color: #ef4444;">Error Running Artifact</h2>
              <p>\${error.message || error}</p>
              <button class="btn" onclick="showTab('errors')">View Error Details</button>
            </div>
          \`;
        }
        
        // Global error handler
        window.onerror = function(msg, url, line, col, error) {
          showError('Runtime Error', error || new Error(\`\${msg} (line \${line}, column \${col})\`));
          return false;
        };
        
        // Load original code
        const originalCode = \`${originalCode.replace(/`/g, '\\`')}\`;
        document.getElementById('original-code').textContent = originalCode;
        
        // Setup components and variables
        window.React = React;
        window.ReactDOM = ReactDOM;
        window.useState = React.useState;
        window.useEffect = React.useEffect;
        window.useRef = React.useRef;
        
        // shadcn UI components
        window.Card = ({className, children, ...props}) => {
          return React.createElement('div', { 
            className: \`bg-gray-800 rounded-lg shadow-lg \${className || ''}\`,
            ...props
          }, children);
        };
        
        window.CardContent = ({className, children, ...props}) => {
          return React.createElement('div', { 
            className: \`p-6 \${className || ''}\`,
            ...props
          }, children);
        };
        
        // Common constants
        window.INITIAL_HEALTH = 100;
        
        // Commonly needed game-related variables
        window.planeRotation = 0;
        window.MOVE_OPTIONS = [
          { dx: 0, dy: 1, name: 'down', rotation: 180 },
          { dx: 1, dy: 0, name: 'right', rotation: 90 },
          { dx: 0, dy: -1, name: 'up', rotation: 0 },
          { dx: -1, dy: 0, name: 'left', rotation: 270 }
        ];
      </script>
      
      <script type="text/babel">
        // Create a container component with error handling
        class ArtifactContainer extends React.Component {
          constructor(props) {
            super(props);
            this.state = {
              hasError: false,
              error: null,
              component: null
            };
          }
          
          componentDidCatch(error, info) {
            this.setState({ hasError: true, error });
            showError('Component Error', error);
          }
          
          componentDidMount() {
            try {
              // This code will execute the artifact code and find a component to render
              const executeArtifact = () => {
                // First we need to make the code compatible with Babel and JSX
                
                // Common transforms to make TypeScript work
                // Remove imports (already handled in global context)
                let processedCode = code.replace(
                  /import\s+.*?from\s+['"][^'"]+['"];?/g, 
                  function(match) { return "// " + match.trim(); }  // Regular function syntax
                );
                                
                // Remove type annotations
                codeToEval = codeToEval.replace(/:\s*[^\s=,;)]+/g, '');
                
                // Remove type assertions
                codeToEval = codeToEval.replace(/as\s+[A-Za-z0-9_]+(\[\])?/g, '');
                
                // Remove angle bracket type assertions
                codeToEval = codeToEval.replace(/<[^<>]*>[^<]*(?=\()/g, '');
                
                // Convert export default to assign to window
                codeToEval = codeToEval.replace(
                  /export\s+default\s+(\w+)/g, 
                  (_, name) => `window.default_export = ${name}`
                );
                
                // Convert export const to assign to window
                codeToEval = codeToEval.replace(
                  /export\s+const\s+(\w+)/g, 
                  (_, name) => `window.${name} = ${name}`
                );
                
                // Remove interfaces and type definitions
                codeToEval = codeToEval.replace(/interface\s+\w+\s*{[^}]*}/g, '');
                codeToEval = codeToEval.replace(/type\s+\w+\s*=\s*[^;]*;/g, '');
                
                // Execute the prepared code using babel-standalone
                try {
                  // Use Babel to transform
                  const transformed = Babel.transform(codeToEval, { 
                    presets: ['react'],
                    filename: 'artifact.tsx' 
                  }).code;
                  
                  // Execute the transformed code
                  eval(transformed);
                } catch (evalError) {
                  throw new Error(\`Failed to execute artifact: \${evalError.message}\`);
                }
                
                // Find component candidate
                let componentName = null;
                
                // Known component names to check
                const knownComponents = ['Game', 'App', 'Main', 'default_export'];
                for (const name of knownComponents) {
                  if (typeof window[name] === 'function') {
                    componentName = name;
                    break;
                  }
                }
                
                // If no known component found, look for any component
                if (!componentName) {
                  const componentCandidates = Object.keys(window).filter(key => 
                    typeof window[key] === 'function' && 
                    /^[A-Z]/.test(key) && 
                    key !== 'React' && 
                    key !== 'ReactDOM' &&
                    key !== 'ArtifactContainer'
                  );
                  
                  if (componentCandidates.length > 0) {
                    componentName = componentCandidates[0];
                  }
                }
                
                return componentName ? window[componentName] : null;
              };
              
              // Execute the artifact code and get the component
              const Component = executeArtifact();
              
              if (Component) {
                this.setState({ component: Component });
              } else {
                throw new Error('No component found in artifact');
              }
            } catch (error) {
              this.setState({ hasError: true, error });
              showError('Execution Error', error);
            }
          }
          
          render() {
            if (this.state.hasError) {
              return (
                <div className="bg-red-900 p-6 rounded-lg max-w-lg text-center">
                  <h2 className="text-xl font-bold mb-4">Error Running Artifact</h2>
                  <p>{this.state.error?.message || 'Unknown error'}</p>
                  <button
                    className="mt-4 bg-red-700 text-white px-4 py-2 rounded"
                    onClick={() => showTab('errors')}
                  >
                    View Error Details
                  </button>
                </div>
              );
            }
            
            if (this.state.component) {
              const Component = this.state.component;
              return <Component />;
            }
            
            return (
              <div className="text-center">
                <div className="spinner"></div>
                <p>Initializing component...</p>
              </div>
            );
          }
        }
        
        // Render the container
        try {
          // Try React 18 createRoot first
          const rootElement = document.getElementById('root');
          try {
            const root = ReactDOM.createRoot(rootElement);
            root.render(<ArtifactContainer />);
          } catch (rootError) {
            // Fall back to older render method
            console.warn("Falling back to legacy ReactDOM.render:", rootError);
            ReactDOM.render(<ArtifactContainer />, rootElement);
          }
          
          // Clear component panel
          document.getElementById('component-panel').innerHTML = '';
        } catch (error) {
          showError('Initialization Error', error);
        }
      </script>
    </body>
    </html>
      `;
    };

    // Simplified but robust code processor
    function processArtifactCode(code) {
      console.log('Processing artifact code with simplified processor...');
      
      // Remove imports
      let processedCode = code.replace(
        /import\s+.*?from\s+['"][^'"]+['"];?/g, 
        match => `// ${match.trim()}`
      );
      
      // Remove TypeScript specific syntax - type annotations
      processedCode = processedCode.replace(/:\s*[A-Za-z0-9_<>[\].,|&'"{}()\s]+(?=[=,);])/g, '');
      
      // Remove generic type parameters
      processedCode = processedCode.replace(/<[A-Za-z0-9_<>[\].,|&'"{}()\s]+>/g, '');
      
      // Handle React FC type
      processedCode = processedCode.replace(/:\s*React\.FC(?:<[^>]*>)?\s*=/g, ' =');
      
      // Convert export default to assign to window
      processedCode = processedCode.replace(
        /export\s+default\s+(\w+)/g, 
        (_, name) => `window.default_export = ${name}`
      );
      
      // Convert export const to assign to window
      processedCode = processedCode.replace(
        /export\s+const\s+(\w+)/g, 
        (_, name) => `const ${name}; window.${name} = ${name}`
      );
      
      // Remove remaining export statements
      processedCode = processedCode.replace(/export\s+/g, '');
      
      // Remove interface and type declarations
      processedCode = processedCode.replace(/(?:interface|type)\s+[^{]*{[^}]*}/gs, '');
      
      console.log('Code simplified for browser execution');
      return processedCode;
    }

    // Updated prepareArtifact function
    const prepareArtifact = async () => {
      try {
        setIsLoading(true);
        console.log('Loading artifact from:', filePath);
        
        // Get the file content
        const originalCode = await window.fs.readFile(filePath, { encoding: 'utf8' }) as string;
        console.log('File content loaded, size:', originalCode.length);
        
        // Create HTML template with original code directly
        const html = createHtmlTemplate(originalCode);
        
        setArtifactHtml(html);
        setIsLoading(false);
      } catch (err) {
        console.error('Error preparing artifact:', err);
        setError(`Error preparing artifact: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    prepareArtifact();
  }, [filePath]);

  const handleIframeLoad = () => {
    // You can add additional setup after iframe loads
    if (iframeRef.current) {
      try {
        // Any additional setup for iframe
      } catch (e) {
        console.error('Error in iframe setup:', e);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={`w-full h-full ${className}`}>
        <CardContent className="p-4 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <p>Loading artifact...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full h-full ${className}`}>
        <CardContent className="p-4">
          <div className="bg-red-100 p-4 rounded border border-red-400 text-red-700">
            <h3 className="font-bold">Error</h3>
            <pre className="mt-2 overflow-auto max-h-64">{error}</pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <div className="absolute top-0 right-0 z-10 bg-gray-700 text-white text-xs p-1 rounded-bl">
        <select 
          onChange={(e) => {
            if (iframeRef.current) {
              const iframe = iframeRef.current;
              if (e.target.value === 'full') {
                iframe.removeAttribute('sandbox');
              } else if (e.target.value === 'safe') {
                iframe.setAttribute('sandbox', 'allow-scripts');
              } else {
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
              }
            }
          }}
          className="bg-gray-600 text-white text-xs p-1 rounded"
        >
          <option value="default">Default Sandbox</option>
          <option value="safe">Safe Mode</option>
          <option value="full">No Sandbox (Debug)</option>
        </select>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={artifactHtml}
        className="w-full h-full border-0 rounded-lg bg-gray-800"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleIframeLoad}
      />
      <div className="absolute bottom-0 left-0 z-10 p-1 bg-gray-700 text-white text-xs flex items-center gap-2">
        <button 
          onClick={() => console.log('Iframe content:', iframeRef.current?.contentWindow)}
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Log Info
        </button>
        <button 
          onClick={() => {
            if (iframeRef.current) {
              iframeRef.current.srcdoc = artifactHtml;
            }
          }}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Reload
        </button>
      </div>
    </div>
  );
};