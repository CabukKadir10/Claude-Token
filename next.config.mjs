import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/infrastructure/i18n/request.ts');

const isStatic = process.env.BUILD_STATIC === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isStatic ? 'export' : undefined,
  images: { unoptimized: isStatic },
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
