// src/components/ArtifactWebView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ArtifactWebViewProps {
  filePath: string;
  className?: string;
}

export const ArtifactWebView: React.FC<ArtifactWebViewProps> = ({ filePath, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artifactHtml, setArtifactHtml] = useState<string>('');

  useEffect(() => {
    const prepareArtifact = async () => {
      try {
        setIsLoading(true);
        
        // Get the file content
        const fileContent = await window.fs.readFile(filePath, { encoding: 'utf8' }) as string;
        
        // Extract the component name (assuming default export)
        const componentNameMatch = fileContent.match(/export\s+default\s+(\w+)/);
        const componentName = componentNameMatch ? componentNameMatch[1] : 'Game'; // Default to Game if not found
        
        // Create a basic HTML template
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Artifact Runner</title>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body { 
                font-family: sans-serif; 
                padding: 0; 
                margin: 0; 
                background-color: #1f2937;
                color: white;
              }
              #root { 
                width: 100%; 
                height: 100vh; 
                display: flex;
                justify-content: center;
                align-items: center;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              // Make dependencies available globally
              const { useState, useEffect, useRef } = React;
              
              // Mock components
              const Card = ({className, children, ...props}) => (
                <div className={\`bg-gray-800 rounded-lg shadow \${className || ''}\`} {...props}>
                  {children}
                </div>
              );
              
              const CardContent = ({className, children, ...props}) => (
                <div className={\`p-6 \${className || ''}\`} {...props}>
                  {children}
                </div>
              );
              
              // Extract and prepare artifact code
              ${fileContent
                .replace(/import\s+.*?from\s+['"](.*?)['"];?/g, '// import from $1')
                .replace(/export\s+default\s+(\w+)/g, '// export default $1')
                .replace(/export\s+const\s+(\w+)/g, 'const $1')}
              
              // Render component
              ReactDOM.render(
                React.createElement(${componentName}, {}), 
                document.getElementById('root')
              );
            </script>
          </body>
          </html>
        `;
        
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

  // Use webview when available, fallback to iframe
  return (
    <div className={`w-full h-full ${className}`}>
      {/* Use a conditional rendering approach to avoid issues with webview not being defined */}
      {'webview' in document.createElement('div') ? (
        <webview
          srcDoc={artifactHtml}
          className="w-full h-full border-0"
          nodeintegration="false"
          webpreferences="contextIsolation=true"
        />
      ) : (
        <iframe
          srcDoc={artifactHtml}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      )}
    </div>
  );
};