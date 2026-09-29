import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the same URL format as the old WordPress site (e.g. /about/).
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  async redirects() {
    return [
      // Old WordPress URLs
      { source: "/home", destination: "/", permanent: true },
      { source: "/author/amitspicyranked-com", destination: "/author/jessica-harper/", permanent: true },
      { source: "/category/uncategorized", destination: "/blog/", permanent: true },
      { source: "/a-comprehensive-guide-to-selling-feet-pictures-safely", destination: "/safety-tips/", permanent: true },
      { source: "/a-guide-to-safely-selling-feet-pictures-online", destination: "/safety-tips/", permanent: true },
      { source: "/comments/feed", destination: "/feed/", permanent: true },
      { source: "/:type(post|page|category|post_tag|author)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-admin", destination: "/admin/", permanent: false },
      { source: "/wp-admin/:path*", destination: "/admin/", permanent: false },
      { source: "/wp-login.php", destination: "/admin/login/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/wp-content/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
