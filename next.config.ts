import type { NextConfig } from "next";

/**
 * Two deploy targets, one codebase.
 * Default (Vercel / local): normal Next server build.
 * GITHUB_PAGES=1: static export for GitHub Pages, mounted under /threadspilot-demo.
 */
const pages = process.env.GITHUB_PAGES === "1";
const repo = "threadspilot-demo";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(pages
    ? {
        output: "export" as const,
        basePath: `/${repo}`,
        assetPrefix: `/${repo}`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
