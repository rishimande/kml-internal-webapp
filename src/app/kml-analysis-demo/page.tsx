'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, FileText, BarChart3, Download, Eye, Clock, CheckCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/forms/file-upload'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

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

          {/* Analysis Results Section - KML Preview Area Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center relative">
                {/* Placeholder for KML viewer */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <p className="text-gray-500">KML Preview Area</p>
                </div>
                
                {/* Navigation arrows */}
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Google Earth Integration */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Google Earth</span>
                  <ChevronDown className="h-4 w-4" />
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
