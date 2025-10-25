module.exports = {
  // Production configuration
  env: {
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000,
    PYTHON_PATH: 'python3',
    MODEL_PATH: './models/best.pt',
    CONFIDENCE_THRESHOLD: 0.2,
    MAX_FILE_SIZE: '50MB',
    ALLOWED_FILE_TYPES: 'image/jpeg,image/png,image/jpg,video/mp4,video/avi,video/mov'
  },
  
  // Next.js configuration
  nextConfig: {
    output: 'standalone',
    experimental: {
      serverComponentsExternalPackages: ['python-shell']
    }
  }
}
