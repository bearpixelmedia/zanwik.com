/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static mirrored pages are served from content/mirror via catch-all route.
  // Static assets live under public/assets-kr (renamed from /_next to avoid collisions).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/assets-kr/:path*",
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
