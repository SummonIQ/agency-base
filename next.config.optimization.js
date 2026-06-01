// Bundle optimization configuration
module.exports = {
  // Optimize client-side bundle
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'react-icons',
    '@heroicons/react',
    'date-fns',
    'recharts',
  ],

  // Server-only packages that should not be bundled client-side
  serverOnlyPackages: [
    'puppeteer',
    'puppeteer-extra',
    'puppeteer-extra-plugin-stealth',
    'cheerio',
    'mammoth',
    '@adobe/helix-md2docx',
    'markdownlint',
    'markdownlint-rule-helpers',
    '@joplin/turndown',
    '@joplin/turndown-plugin-gfm',
  ],

  // Webpack configuration for bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace server-only modules with empty modules on client
      config.resolve.alias = {
        ...config.resolve.alias,
        puppeteer: false,
        'puppeteer-extra': false,
        'puppeteer-extra-plugin-stealth': false,
        cheerio: false,
        mammoth: false,
        '@adobe/helix-md2docx': false,
        markdownlint: false,
        'markdownlint-rule-helpers': false,
      };
    }

    // Tree shake unused icon imports
    config.module.rules.push({
      test: /lucide-react/,
      sideEffects: false,
    });

    return config;
  },

  // Experimental features for better optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
};