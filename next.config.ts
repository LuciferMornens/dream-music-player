import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
  generateEtags: false,
  // Add webpack configuration for audio files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name][ext]'
      }
    });
    return config;
  },
};

export default nextConfig;
