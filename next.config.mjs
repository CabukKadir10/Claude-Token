import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/infrastructure/i18n/request.ts');

const isStatic = process.env.BUILD_STATIC === '1';
const rawBasePath = process.env.BASE_PATH ?? '';
const normalizedBasePath =
  rawBasePath && rawBasePath !== '/'
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isStatic ? 'export' : undefined,
  images: { unoptimized: isStatic },
  trailingSlash: isStatic,
  basePath: isStatic ? normalizedBasePath : undefined,
  assetPrefix: isStatic && normalizedBasePath ? `${normalizedBasePath}/` : undefined,
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
