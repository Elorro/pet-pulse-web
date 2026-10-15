import type { NextConfig } from "next";

import { serverEnv } from "./src/env";

// Fail fast at startup if any required env var is missing or invalid.
// Importing src/env validates the public vars; this call validates the server ones.
serverEnv();

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
