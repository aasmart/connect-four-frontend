/** @type {import('next').NextConfig} */
const nextConfig = {
    
}

module.exports = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.SERVER_PROTOCOL}${process.env.SERVER_URL}:${process.env.SERVER_PORT}/api/:path*`,
            }
        ];
    }
}
