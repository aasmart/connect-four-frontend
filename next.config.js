/** @type {import('next').NextConfig} */
const nextConfig = {
    
}

module.exports = () => {
    const rewrites = () => {
        return [
          {
            source: "/api/:path*",
            destination: "http://192.168.5.77:8080/api/:path*",
          }
        ];
      };
      return {
        rewrites,
    };
}
