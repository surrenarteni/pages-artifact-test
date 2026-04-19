import type { NextConfig } from "next";
import path from 'path';

const repoName = 'pages-artifact-test';
const isPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for Electron
  distDir: 'dist', // Customise build directory
  basePath: isPages ? `/${repoName}` : '',
  assetPrefix: isPages ? `/${repoName}/` : '',
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Required for static export
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // Handle SVGs
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      artifacts: path.join(process.cwd(), 'artifacts'),
    };

    // Add support for native modules
    config.externals.push({
      'electron': 'require("electron")',
      'electron-devtools-installer': 'require("electron-devtools-installer")',
    });

    return config;
  },
};

export default nextConfig;