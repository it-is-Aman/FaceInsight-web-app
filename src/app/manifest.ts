import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FaceInsight AI",
    short_name: "FaceInsight",
    description: "AI skin check and personalised routine from one selfie.",
    start_url: "/analyze",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#1f7f86",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
