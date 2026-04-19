'use client';

import React, { useState, useEffect } from 'react';

interface DynamicArtifactProps {
  code?: string;
  filePath?: string;
  className?: string;
}

export const DynamicArtifact: React.FC<DynamicArtifactProps> = ({ code, filePath, className }) => {
  const [content, setContent] = useState<string>(code || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!code && !!filePath);

  useEffect(() => {
    if (filePath && !code) {
      const loadContent = async () => {
        try {
          setIsLoading(true);
          // Load file content if not provided directly
          const fileContent = await window.fs.readFile(filePath, { encoding: 'utf8' });
          setContent(fileContent as string);
          setError(null);
        } catch (err) {
          console.error('Error loading file:', err);
          setError(`Failed to load file: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [filePath, code]);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading component...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded border border-red-400 text-red-700">
        <h3 className="font-bold">Error</h3>
        <pre className="mt-2 overflow-auto max-h-64">{error}</pre>
      </div>
    );
  }

  // For now, just display the code - we'll improve this in next steps
  return (
    <div className={className}>
      <div className="p-4">
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-[600px]">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};