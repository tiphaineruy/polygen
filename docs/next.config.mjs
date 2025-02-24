import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['next-mdx-remote'],
  output: 'export',
  basePath: process.env.DOCS_BASE_PATH ?? '',
};

export default withMDX(config);
