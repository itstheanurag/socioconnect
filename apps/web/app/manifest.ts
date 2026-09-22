import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SocioConnect | Multi-Channel Social Command Studio",
    short_name: "SocioConnect",
    description: "Write once, publish natively everywhere across YouTube, X, LinkedIn, Reddit, Discord, and Instagram.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#1C1917",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
