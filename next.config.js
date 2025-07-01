// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This is the crucial line for static export
  // Optional: Add other Next.js configurations here if needed
  // For example, if you were using images, you might configure image optimization:
  // images: {
  //   unoptimized: true, // For static export, disable Next.js Image Optimization
  // },
};

module.exports = nextConfig;
