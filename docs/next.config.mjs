import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['next-mdx-remote'],
  output: 'export',
  basePath: '/polygen',
};

export default withMDX(config);
