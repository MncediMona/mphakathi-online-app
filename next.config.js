/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // This tells Next.js where your Netlify functions are if they are outside /api
  // Not strictly necessary if Netlify is handling this with its build plugin for Next.js,
  // but good to keep in mind for more complex setups.
  // async rewrites() {
  //   return [
  //     {
  //       source: '/.netlify/functions/:path*',
  //       destination: `/.netlify/functions/:path*`,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
