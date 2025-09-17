'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, FileText, BarChart3, Download, Eye, Clock, CheckCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/forms/file-upload'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

// Google Maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

/**
 * KML Analysis Demo Page
 * 
 * This page provides a comprehensive interface for uploading and analyzing KML files.
 * Features include:
 * - File upload with drag & drop support
 * - Real-time upload progress
 * - File validation and error handling
 * - Mock analysis processing
 * - Results visualization
 */

interface AnalysisResult {
  id: string
  fileName: string
  fileKey: string
  status: 'processing' | 'completed' | 'error'
  progress: number
  results?: {
    totalFeatures: number
    geometryTypes: string[]
    boundingBox: {
      north: number
      south: number
      east: number
      west: number
    }
    statistics: {
      points: number
      lines: number
      polygons: number
    }
  }
  createdAt: string
}

export default function KmlAnalysisDemoPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [hasValidApiKey, setHasValidApiKey] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Sample images for the carousel - using free stock images
  const carouselImages = [
    {
      id: 1,
      type: 'map',
      title: 'Google Maps KML Viewer',
      description: 'Interactive KML visualization with Google Maps API'
    },
    {
      id: 2,
      src: 'https://placekitten.com/800/400?image=2',
      alt: 'KML File Processing',
      title: 'KML File Processing'
    },
    {
      id: 3,
      src: 'https://placekitten.com/800/400?image=3',
      alt: 'Map Visualization',
      title: 'Map Visualization'
    },
    {
      id: 4,
      src: 'https://placekitten.com/800/400?image=4',
      alt: 'Data Analytics Dashboard',
      title: 'Data Analytics Dashboard'
    },
    {
      id: 5,
      src: 'https://placekitten.com/800/400?image=5',
      alt: 'Geographic Information System',
      title: 'Geographic Information System'
    }
  ]

  // Load Google Maps API
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null

    const loadGoogleMapsAPI = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setIsMapLoaded(true)
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Script is already loaded or loading, just wait for it
        checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            if (checkInterval) clearInterval(checkInterval)
            setIsMapLoaded(true)
          }
        }, 100)
        return
      }

      // Only load if we have a valid API key
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.warn('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file')
        setHasValidApiKey(false)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script'
      document.head.appendChild(script)

      window.initMap = () => {
        setIsMapLoaded(true)
      }
    }

    loadGoogleMapsAPI()

    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [])

  // Initialize map when it's loaded and we're on the map slide
  useEffect(() => {
    if (isMapLoaded && currentImageIndex === 0 && mapRef.current && !mapInstanceRef.current) {
      initMap()
    }
  }, [isMapLoaded, currentImageIndex])

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    // Create the map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.0, lng: 78.0 }, // Default center (India)
      zoom: 6,
      mapTypeId: "satellite", // Satellite view
    })

    // Load KML file from Cloudinary URL
    const kmlLayer = new window.google.maps.KmlLayer({
      url: "https://res.cloudinary.com/dk983csnp/raw/upload/v1758066685/MAH-PAN_04._umrai_bismilla._khan_2biga_crt_eegquf.kml",
      map: map,
      preserveViewport: false,   // auto-zoom to fit KML
      suppressInfoWindows: false // show popups if available
    })

    mapInstanceRef.current = map
  }

  /**
   * Handles successful file upload and initiates analysis
   */
  const handleUploadComplete = async (fileKey: string, analysisId: string) => {
    const fileName = fileKey.split('/').pop() || 'Unknown file'
    
    // Create new analysis result entry
    const newAnalysis: AnalysisResult = {
      id: analysisId,
      fileName,
      fileKey,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString()
    }

    setAnalysisResults(prev => [newAnalysis, ...prev])
    setIsProcessing(true)

    // Simulate analysis progress updates
    const progressInterval = setInterval(async () => {
      try {
        // In a real app, this would call the actual API
        const mockStatus = await new Promise<{ status: string, progress: number }>((resolve) => {
          setTimeout(() => {
            const statuses = ['processing', 'processing', 'processing', 'completed']
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
            const progress = randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 80) + 20
            resolve({ status: randomStatus, progress })
          }, 1000)
        })

        setAnalysisResults(prev => prev.map(result => 
          result.id === analysisId 
            ? { 
                ...result, 
                status: mockStatus.status as 'processing' | 'completed',
                progress: mockStatus.progress,
                ...(mockStatus.status === 'completed' && {
                  results: {
                    totalFeatures: Math.floor(Math.random() * 100) + 10,
                    geometryTypes: ['Point', 'LineString', 'Polygon'].slice(0, Math.floor(Math.random() * 3) + 1),
                    boundingBox: {
                      north: 40.7128 + Math.random() * 0.1,
                      south: 40.7128 - Math.random() * 0.1,
                      east: -74.0060 + Math.random() * 0.1,
                      west: -74.0060 - Math.random() * 0.1
                    },
                    statistics: {
                      points: Math.floor(Math.random() * 50),
                      lines: Math.floor(Math.random() * 30),
                      polygons: Math.floor(Math.random() * 20)
                    }
                  }
                })
              }
            : result
        ))

        if (mockStatus.status === 'completed') {
          clearInterval(progressInterval)
          setIsProcessing(false)
        }
      } catch (error) {
        console.error('Error checking analysis status:', error)
        clearInterval(progressInterval)
        setIsProcessing(false)
      }
    }, 2000)

    // Cleanup interval after 30 seconds to prevent infinite loops
    setTimeout(() => {
      clearInterval(progressInterval)
      setIsProcessing(false)
    }, 30000)
  }

  /**
   * Handles upload errors
   */
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // You could add a toast notification here
  }

  /**
   * Formats file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Formats date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  /**
   * Carousel navigation functions
   */
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            KML Analysis Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your KML files and get detailed analysis including feature counts, 
            geometry types, bounding boxes, and more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Upload KML File</span>
                </CardTitle>
                <CardDescription>
                  Upload your KML or KMZ file to start the analysis process. 
                  Files are securely uploaded using presigned URLs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  maxFileSize={50}
                  acceptedTypes={['.kml', '.kmz']}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* KML Preview Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">KML Preview Area</h3>
                <p className="text-sm text-muted-foreground">Explore sample visualizations and analysis results</p>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg h-80 overflow-hidden group">
                {/* Carousel Content */}
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {carouselImages[currentImageIndex].type === 'map' ? (
                    <>
                      {/* Google Maps Container */}
                      <div 
                        ref={mapRef}
                        className="w-full h-full"
                        style={{ minHeight: '320px' }}
                      />
                      
                      {/* Map Loading Overlay */}
                      {!isMapLoaded && hasValidApiKey && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading Google Maps...</p>
                          </div>
                        </div>
                      )}

                      {/* API Key Missing Overlay */}
                      {!hasValidApiKey && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                              <span className="text-2xl">🗺️</span>
                            </div>
                            <h4 className="font-medium text-gray-800 mb-2">Google Maps API Key Required</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              To view the interactive KML map, please add your Google Maps API key to the environment variables.
                            </p>
                            <div className="bg-gray-200 rounded p-3 text-xs font-mono text-left">
                              <p className="text-gray-700">Add to .env.local:</p>
                              <p className="text-blue-600">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Regular Image */}
                      <img
                        src={carouselImages[currentImageIndex].src}
                        alt={carouselImages[currentImageIndex].alt}
                        className="w-full h-full object-cover"
                      />
                    </>
                  )}
                  
                  {/* Content Overlay with Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h4 className="text-white font-medium text-sm">
                      {carouselImages[currentImageIndex].title}
                    </h4>
                    {carouselImages[currentImageIndex].description && (
                      <p className="text-white/80 text-xs mt-1">
                        {carouselImages[currentImageIndex].description}
                      </p>
                    )}
                  </div>
                </motion.div>
                
                {/* Navigation Arrows */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center space-x-2 mt-4">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex 
                        ? 'bg-primary' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Google Earth Integration */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Google Earth</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentImageIndex + 1} of {carouselImages.length}
                </div>
              </div>
              
              {/* Timeline/Progress indicators */}
              <div className="mt-6 flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Analysis Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Geographic Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed bounding box coordinates and geographic extent of your KML data.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Feature Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive counts of points, lines, and polygons in your KML file.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Format Support</h3>
                <p className="text-sm text-muted-foreground">
                  Support for both KML and KMZ files with automatic format detection.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
