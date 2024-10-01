/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Abaikan 'fs' jika build untuk client-side
        if (!isServer) {
          config.resolve.fallback = {
            fs: false,
          };
        }
    
        return config;
      },
};

export default nextConfig;
