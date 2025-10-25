# Deployment Guide for Threat Detection System

## 🚀 Render Deployment

Your project is now ready for deployment on Render! Here's how to deploy it:

### 1. Connect to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the `Ao-chuba/detection` repository
4. Choose the `main` branch

### 2. Configure Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment:**
- **Node.js**: 18.x
- **Python**: 3.9

### 3. Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
PYTHON_PATH=python3
MODEL_PATH=./models/best.pt
CONFIDENCE_THRESHOLD=0.2
```

### 4. Advanced Settings

- **Plan**: Starter (free tier) or higher
- **Region**: Choose closest to your users
- **Health Check Path**: `/`
- **Auto-Deploy**: Enable for automatic deployments

## 🐳 Docker Deployment (Alternative)

If you prefer Docker deployment:

```bash
# Build the image
docker build -t threat-detection .

# Run the container
docker run -p 3000:3000 threat-detection
```

## 📁 Project Structure

```
detection/
├── app/                    # Next.js app directory
│   ├── api/detection/      # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/             # React components
├── lib/                    # Utility libraries
├── temp/                   # Temporary files (auto-created)
├── threat_detector.py      # Python detection engine
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── Dockerfile             # Docker configuration
├── render.yaml            # Render configuration
└── README.md              # Project documentation
```

## 🔧 Production Features

- ✅ **Automatic Python dependency installation**
- ✅ **Optimized Docker build**
- ✅ **Environment-based configuration**
- ✅ **Health check endpoints**
- ✅ **File upload handling**
- ✅ **Video processing with XVID codec**
- ✅ **Object detection with confidence filtering**

## 🚨 Important Notes

1. **Model Files**: The YOLO model files (`*.pt`) are not included in the repository due to size. You'll need to upload them separately or use a model hosting service.

2. **File Storage**: Temporary files are stored in the `temp/` directory. For production, consider using cloud storage (AWS S3, etc.).

3. **Performance**: The free tier on Render has limited resources. For production use, consider upgrading to a paid plan.

4. **Security**: Update the CORS settings and add authentication for production use.

## 🔍 Monitoring

- **Health Check**: `GET /` - Returns application status
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, Memory usage in Render dashboard

## 🆘 Troubleshooting

### Common Issues:

1. **Python not found**: Ensure Python 3.9+ is installed
2. **Model file missing**: Upload your trained model to the repository
3. **Memory issues**: Upgrade to a higher Render plan
4. **Build failures**: Check the build logs in Render dashboard

### Debug Commands:

```bash
# Check Python installation
python3 --version

# Check Node.js installation
node --version

# Install dependencies manually
npm install
pip install -r requirements.txt
```

## 📞 Support

For issues with deployment:
1. Check Render dashboard logs
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check file permissions

---

**Repository**: [https://github.com/Ao-chuba/detection](https://github.com/Ao-chuba/detection)

**Ready for deployment!** 🎉
