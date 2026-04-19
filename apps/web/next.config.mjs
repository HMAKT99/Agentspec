/**
 * Next config tuned for GitHub Pages (static export) + local `next dev`.
 *
 * - `output: 'export'` → produces a fully static site in `out/` on build.
 *   No API routes, no `headers()/cookies()`, no server-runtime features;
 *   we deliberately don't use any of those.
 * - `basePath` + `assetPrefix` → set via the `BASE_PATH` env var so the
 *   workflow can point the site at `https://<user>.github.io/<repo>/`
 *   without code changes. Leave unset for local `next dev`.
 * - `trailingSlash: true` is GitHub Pages-safe: every route resolves to
 *   an `index.html` under its own directory, which Pages serves cleanly.
 * - `images.unoptimized: true` because GitHub Pages is static (no image
 *   optimization server). We don't use `next/image` anywhere today; this
 *   is future-proofing.
 */

const basePath = process.env.BASE_PATH?.trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
