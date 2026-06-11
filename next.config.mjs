/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Internal admin tool with few images; skip the optimization pipeline.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
