/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        // Add more polyfills for WalletConnect
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      }

      // Ignore node-gyp-build warnings
      config.module.rules.push({
        test: /node_modules\/node-gyp-build\/index\.js$/,
        loader: 'null-loader',
      })

      // Suppress critical dependency warnings for specific modules
      config.module.rules.push({
        test: /node_modules\/(bufferutil|utf-8-validate)/,
        loader: 'ignore-loader',
      })

      // Add webpack plugins to provide global variables
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      )

      // Ignore warnings for node-gyp-build
      config.ignoreWarnings = [
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        /Module not found: Can't resolve 'bufferutil'/,
        /Module not found: Can't resolve 'utf-8-validate'/,
      ]
    }
    return config
  },
  transpilePackages: ['@walletconnect/legacy-client', '@walletconnect/legacy-provider'],
  // Suppress warnings during build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
