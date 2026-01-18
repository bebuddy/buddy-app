import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@ionic/react", "@ionic/core", "@stencil/core", "ionicons"],
  experimental: {
    // Ionic CSS uses :host-context, which LightningCSS doesn't parse; disable to allow build.
    optimizeCss: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
