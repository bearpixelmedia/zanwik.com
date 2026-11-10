/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static pages are served from content/mirror via the catch-all route.
  // Built assets live under public/assets (not /_next, to avoid build collisions).
  // Images are local; disable the optimizer and do not allow arbitrary remote hosts.
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
