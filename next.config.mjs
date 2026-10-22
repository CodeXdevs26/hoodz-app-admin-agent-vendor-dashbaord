/** @type {import('next').NextConfig} */

// Build a Content-Security-Policy that still allows the third-party pieces
// this app actually uses (Google Maps/Fonts, the API origin for XHR/fetch,
// image CDNs). Adjust NEXT_PUBLIC_BASE_URL / add hosts here if you wire
// up new external services.
const apiOrigin = process.env.NEXT_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_BASE_URL).origin
  : "";

const csp = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline'/'unsafe-eval' for its own runtime chunks in dev;
  // keep this tight in production if you introduce a nonce-based setup later.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: https:`,
  `connect-src 'self' https: wss: ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  // Don't leak "X-Powered-By: Next.js" — trivial fingerprinting info for attackers.
  poweredByHeader: false,

  allowedDevOrigins: ["10.10.10.27"],

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
        // TODO: narrow this to your actual image/CDN host(s) once known
        // (e.g. your S3/Cloudfront/Cloudinary domain). A wildcard hostname
        // lets the Next.js image optimizer be used as an open image proxy
        // for arbitrary remote URLs, which is an SSRF / abuse risk.
        hostname: "**",
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
