"use client"

import { useState, useRef } from "react"
import { BubbleCursor } from "@/components/bubble-cursor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Play, 
  Download, 
  Image as ImageIcon, 
  Video, 
  Target, 
  Zap, 
  Eye,
  BarChart3,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Ship,
  Bomb,
  User,
  Trash2
} from "lucide-react"

interface DetectionResult {
  originalImage: string
  detectedImage: string
  originalFileName?: string
  detections: {
    class: string
    confidence: number
    threat_level?: string
    bbox: [number, number, number, number] // [x, y, width, height]
    color: string
  }[]
  processingTime: number
  totalObjects: number
  overallThreatLevel?: string
  overallThreatScore?: number
  threatCount?: number
}

const DETECTION_CLASSES = {
  "Mines - v1 2025-05-15 8-03pm": { label: "Mines", icon: Bomb, color: "bg-red-500", textColor: "text-red-400" },
  "mayin": { label: "Mines", icon: Bomb, color: "bg-red-500", textColor: "text-red-400" },
  "Submarine": { label: "Submarine", icon: Ship, color: "bg-blue-500", textColor: "text-blue-400" },
  "auv-rov": { label: "AUV/ROV", icon: Ship, color: "bg-cyan-500", textColor: "text-cyan-400" },
  "divers": { label: "Divers", icon: User, color: "bg-green-500", textColor: "text-green-400" }
}

const THREAT_LEVELS = {
  CRITICAL: { label: "Critical", color: "bg-red-600", textColor: "text-red-300", icon: "🚨" },
  HIGH: { label: "High", color: "bg-orange-500", textColor: "text-orange-300", icon: "⚠️" },
  MEDIUM: { label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-300", icon: "⚡" },
  LOW: { label: "Low", color: "bg-green-500", textColor: "text-green-300", icon: "ℹ️" },
  MINIMAL: { label: "Minimal", color: "bg-gray-500", textColor: "text-gray-300", icon: "ℹ️" },
  NONE: { label: "None", color: "bg-gray-600", textColor: "text-gray-400", icon: "✅" }
}

export default function DetectionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [results, setResults] = useState<DetectionResult[]>([])
  const [activeTab, setActiveTab] = useState("image")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "image")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      // Call the API
      const response = await fetch("/api/detection/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Detection failed")
      }

      const result = await response.json()

      if (result.success) {
        const detectionResult: DetectionResult = {
          originalImage: URL.createObjectURL(selectedFile),
          detectedImage: result.detectedImage,
          originalFileName: result.originalFileName,
          detections: result.detections,
          processingTime: result.processingTime,
          totalObjects: result.detections.length,
          overallThreatLevel: result.overallThreatLevel,
          overallThreatScore: result.overallThreatScore,
          threatCount: result.threatCount
        }

        setResults(prev => [detectionResult, ...prev])
      } else {
        throw new Error("Detection failed")
      }
    } catch (error) {
      console.error("Detection error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const processVideo = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "video")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 5
        })
      }, 1000)

      // Call the API
      const response = await fetch("/api/detection/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Video detection failed")
      }

      const result = await response.json()

      if (result.success) {
        const detectionResult: DetectionResult = {
          originalImage: URL.createObjectURL(selectedFile),
          detectedImage: result.detectedVideo || result.detectedImage,
          originalFileName: result.originalFileName,
          detections: result.detections,
          processingTime: result.processingTime,
          totalObjects: result.detections.length,
          overallThreatLevel: result.overallThreatLevel,
          overallThreatScore: result.overallThreatScore,
          threatCount: result.threatCount
        }

        setResults(prev => [detectionResult, ...prev])
      } else {
        throw new Error("Video detection failed")
      }
    } catch (error) {
      console.error("Video detection error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const getClassIcon = (className: string) => {
    const classInfo = DETECTION_CLASSES[className as keyof typeof DETECTION_CLASSES]
    return classInfo ? classInfo.icon : Target
  }

  const getClassColor = (className: string) => {
    const classInfo = DETECTION_CLASSES[className as keyof typeof DETECTION_CLASSES]
    return classInfo ? classInfo.color : "bg-gray-500"
  }

  const getClassTextColor = (className: string) => {
    const classInfo = DETECTION_CLASSES[className as keyof typeof DETECTION_CLASSES]
    return classInfo ? classInfo.textColor : "text-gray-400"
  }

  const getThreatLevelInfo = (threatLevel: string) => {
    const levelInfo = THREAT_LEVELS[threatLevel as keyof typeof THREAT_LEVELS]
    return levelInfo || THREAT_LEVELS.NONE
  }

  const downloadFile = (fileData: string, filename: string) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = fileData
      link.download = filename
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const deleteResult = (index: number) => {
    if (window.confirm('Are you sure you want to delete this detection result?')) {
      setResults(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 relative">
      <BubbleCursor />
      
      {/* Header Section */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center mr-4">
                <Target className="w-8 h-8 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Object Detection
              </h1>
            </div>
            <p className="text-xl text-cyan-200 max-w-3xl mx-auto leading-relaxed">
              Advanced YOLO-based object detection system for marine security operations. 
              Detect submarines, AUVs, mines, and divers in underwater environments with high accuracy.
            </p>
          </div>

          {/* Detection Classes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Object.entries(DETECTION_CLASSES).map(([key, classInfo]) => {
              const IconComponent = classInfo.icon
              return (
                <Card key={key} className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${classInfo.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-white">{classInfo.label}</div>
                    <div className="text-xs text-cyan-300 capitalize">{key}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Model Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">30+ FPS</div>
                <div className="text-sm text-cyan-300">Detection Speed</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">4 Classes</div>
                <div className="text-sm text-cyan-300">Detection Types</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">95%+</div>
                <div className="text-sm text-cyan-300">Accuracy</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">YOLO</div>
                <div className="text-sm text-cyan-300">Architecture</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Processing Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/40 backdrop-blur-md border border-cyan-500/30">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image Detection</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Video Detection</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-6">
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    <span>Image Detection</span>
                  </CardTitle>
                  <CardDescription className="text-cyan-300">
                    Upload an underwater image to detect submarines, AUVs, mines, and divers using our YOLO model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload an image or drag and drop</p>
                    <p className="text-sm text-cyan-300 mb-4">Supports JPG, PNG, BMP formats</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                    >
                      Choose File
                    </Button>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-white">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-cyan-300">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>

                  {/* Processing Controls */}
                  <div className="flex justify-center">
                    <Button
                      onClick={processImage}
                      disabled={!selectedFile || isProcessing}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Detect Objects
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-cyan-300">
                        <span>Detecting objects...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="mt-6">
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <span>Video Detection</span>
                  </CardTitle>
                  <CardDescription className="text-cyan-300">
                    Upload an underwater video to detect objects in real-time across all frames.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Video className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload a video or drag and drop</p>
                    <p className="text-sm text-cyan-300 mb-4">Supports MP4, AVI, MOV, MKV formats</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                    >
                      Choose Video
                    </Button>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-white">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-cyan-300">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>

                  {/* Processing Controls */}
                  <div className="flex justify-center">
                    <Button
                      onClick={processVideo}
                      disabled={!selectedFile || isProcessing}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Detect in Video
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-cyan-300">
                        <span>Processing video frames...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span>Detection Results</span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all detection results?')) {
                      setResults([])
                    }
                  }}
                  className="border-red-400/50 text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-6">
                {results.map((result, index) => (
                  <Card key={index} className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Images */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white">Original</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const isVideo = result.originalImage.includes('video/mp4')
                                  const extension = isVideo ? 'mp4' : 'jpg'
                                  const filename = `original_${result.originalFileName || 'file'}.${extension}`
                                  downloadFile(result.originalImage, filename)
                                }}
                                className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            {result.originalImage.includes('video/mp4') ? (
                              <video 
                                src={result.originalImage} 
                                controls
                                className="w-full h-48 object-cover rounded-lg border border-cyan-500/30"
                              />
                            ) : (
                              <img 
                                src={result.originalImage} 
                                alt="Original" 
                                className="w-full h-48 object-cover rounded-lg border border-cyan-500/30"
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white">Detected Objects</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const isVideo = result.detectedImage.includes('video/mp4') || result.detectedImage.includes('video/avi')
                                  const extension = isVideo ? (result.detectedImage.includes('video/avi') ? 'avi' : 'mp4') : 'jpg'
                                  const filename = `detected_${result.originalFileName || 'file'}.${extension}`
                                  downloadFile(result.detectedImage, filename)
                                }}
                                className="border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10 text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            {result.detectedImage.includes('video/mp4') || result.detectedImage.includes('video/avi') ? (
                              <video 
                                src={result.detectedImage} 
                                controls
                                className="w-full h-48 object-cover rounded-lg border border-emerald-500/30"
                              />
                            ) : (
                              <img 
                                src={result.detectedImage} 
                                alt="Detected" 
                                className="w-full h-48 object-cover rounded-lg border border-emerald-500/30"
                              />
                            )}
                          </div>
                        </div>

                        {/* Detection Results */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Detection Summary</h3>
                            <div className="flex space-x-2">
                              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                                {result.totalObjects} objects found
                              </Badge>
                              {result.overallThreatLevel && (
                                <Badge 
                                  variant="secondary" 
                                  className={`${getThreatLevelInfo(result.overallThreatLevel).color} ${getThreatLevelInfo(result.overallThreatLevel).textColor}`}
                                >
                                  {getThreatLevelInfo(result.overallThreatLevel).icon} {getThreatLevelInfo(result.overallThreatLevel).label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {result.overallThreatLevel && result.overallThreatScore !== undefined && (
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">Overall Threat Assessment</span>
                                <span className={`text-sm font-bold ${getThreatLevelInfo(result.overallThreatLevel).textColor}`}>
                                  {getThreatLevelInfo(result.overallThreatLevel).icon} {getThreatLevelInfo(result.overallThreatLevel).label}
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getThreatLevelInfo(result.overallThreatLevel).color}`}
                                  style={{ width: `${result.overallThreatScore * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-cyan-300 mt-1">
                                Threat Score: {(result.overallThreatScore * 100).toFixed(1)}%
                              </div>
                            </div>
                          )}
                          
                          {result.detections.length > 0 ? (
                            <div className="space-y-3">
                              {result.detections.map((detection, idx) => {
                                const IconComponent = getClassIcon(detection.class)
                                return (
                                  <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 ${getClassColor(detection.class)} rounded-lg flex items-center justify-center`}>
                                          <IconComponent className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <div className={`font-semibold ${getClassTextColor(detection.class)}`}>
                                            {DETECTION_CLASSES[detection.class as keyof typeof DETECTION_CLASSES]?.label || detection.class}
                                          </div>
                                          <div className="text-xs text-cyan-300">
                                            Confidence: {(detection.confidence * 100).toFixed(1)}%
                                          </div>
                                          {detection.threat_level && (
                                            <div className="text-xs mt-1">
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getThreatLevelInfo(detection.threat_level).color} ${getThreatLevelInfo(detection.threat_level).textColor}`}>
                                                {getThreatLevelInfo(detection.threat_level).icon} {getThreatLevelInfo(detection.threat_level).label}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`${getClassTextColor(detection.class)} border-current`}
                                      >
                                        {(detection.confidence * 100).toFixed(1)}%
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-cyan-300">
                                      Position: ({detection.bbox[0].toFixed(0)}, {detection.bbox[1].toFixed(0)}) 
                                      Size: {detection.bbox[2].toFixed(0)}×{detection.bbox[3].toFixed(0)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                              <p className="text-yellow-300">No objects detected</p>
                              <p className="text-sm text-cyan-300 mt-1">Try uploading a different image</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                            <div className="text-sm text-cyan-300">
                              Processing time: {result.processingTime}s
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const isVideo = result.detectedImage.includes('video/mp4') || result.detectedImage.includes('video/avi')
                                  const extension = isVideo ? (result.detectedImage.includes('video/avi') ? 'avi' : 'mp4') : 'jpg'
                                  const filename = `detected_${result.originalFileName || 'file'}.${extension}`
                                  downloadFile(result.detectedImage, filename)
                                }}
                                className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteResult(index)}
                                className="border-red-400/50 text-red-300 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Model Information */}
          <div className="mt-12">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Model Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Threat Detection Classes</h4>
                    <ul className="space-y-2 text-cyan-300">
                      <li>• <strong className="text-white">Mines:</strong> Naval mines and explosive devices (Critical threat)</li>
                      <li>• <strong className="text-white">Submarine:</strong> Military and civilian submarines (High threat)</li>
                      <li>• <strong className="text-white">AUV/ROV:</strong> Autonomous Underwater Vehicles (Medium threat)</li>
                      <li>• <strong className="text-white">Divers:</strong> Human divers and underwater personnel (Low threat)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Threat Assessment System</h4>
                    <ul className="space-y-2 text-cyan-300">
                      <li>• <strong className="text-white">Model:</strong> Custom YOLO (detection/best.pt)</li>
                      <li>• <strong className="text-white">Confidence Threshold:</strong> 0.3 (optimized for detection)</li>
                      <li>• <strong className="text-white">Threat Levels:</strong> Critical, High, Medium, Low, Minimal</li>
                      <li>• <strong className="text-white">Assessment:</strong> Weighted scoring system</li>
                      <li>• <strong className="text-white">Real-time:</strong> Advanced threat analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
