import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
    agentRules: false,
    images: { unoptimized: true },
    output: 'export',
};

export default createMDX()(nextConfig);
