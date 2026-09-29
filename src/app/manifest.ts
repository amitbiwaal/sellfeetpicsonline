import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "minimal-ui",
    background_color: "#fff5f8",
    theme_color: "#d81e66",
    icons: [
      { src: "/images/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/images/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
