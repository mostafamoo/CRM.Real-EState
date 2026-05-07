import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estata CRM",
    short_name: "Estata",
    description: "A modern CRM for real estate brokers, teams, and agents.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0d9488",
    theme_color: "#0d9488",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
