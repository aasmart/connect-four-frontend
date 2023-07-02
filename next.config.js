/** @type {import('next').NextConfig} */
const nextConfig = {
    
}

module.exports = () => {
    const rewrites = () => {
        return [
          {
            source: "/api/:path*",
            destination: `https://${process.env.SITE_URL}/api/:path*`,
          }
        ];
      };
      return {
        rewrites,
    };
}
