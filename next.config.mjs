/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dsysfsm2o/image/upload/**', // Específico para tu cuenta de Cloudinary
      },
    ],
  },
};

export default nextConfig;