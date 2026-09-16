import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `npm run build` produces a plain `out/` folder
  // with HTML/CSS/JS that any static host (e.g. statichost.eu) can serve.
  // No Node server needed. Server features (API routes, ISR,
  // middleware) do NOT work in this mode — this project uses none.
  output: "export",
};

export default nextConfig;
