/** @type {import('next').NextConfig} */

// Build a Content-Security-Policy that still allows the third-party pieces
// this app actually uses (Google Maps/Fonts, the API origin for XHR/fetch,
// image CDNs). Adjust NEXT_PUBLIC_BASE_URL / add hosts here if you wire
// up new external services.
const apiOrigin = process.env.NEXT_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_BASE_URL).origin
  : "";

const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com"
  : "script-src 'self' 'unsafe-inline' https://maps.googleapis.com";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://hoodz.fra1.digitaloceanspaces.com https://fra1.digitaloceanspaces.com https://maps.gstatic.com https://maps.googleapis.com",
  `connect-src 'self' https: wss: ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  // Don't leak "X-Powered-By: Next.js" — trivial fingerprinting info for attackers.
  poweredByHeader: false,

  redirects: async () => [
    {
      source: "/",
      destination: "/admin/dashboard",
      permanent: false,
    },
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hoodz.fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "fra1.digitaloceanspaces.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
