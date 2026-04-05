/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/customer/bookings",
        destination: "/customer/components/bookings",
      },
    ];
  },
};

module.exports = nextConfig;
