/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma'nın build sırasında server-side'da düzgün çalışması için (Next.js 14)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
