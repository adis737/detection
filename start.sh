#!/bin/bash

# Production startup script
echo "Starting Threat Detection System..."

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p temp/input temp/output

# Set permissions
chmod +x temp/

# Start the application
echo "Starting Next.js application on port ${PORT:-3000}"
npm start
