'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  requestPresignedUrl, 
  uploadFileToS3, 
  processKmlFile,
  type PresignedUrlResponse,
  type UploadStatus,
  type UploadProgress
} from '@/lib/api-service'

interface FileUploadProps {
  onUploadComplete?: (fileKey: string, analysisId: string) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

/**
 * FileUpload component for handling KML file uploads with presigned URLs
 * Features:
 * - Drag and drop support
 * - File validation
 * - Upload progress tracking
 * - Error handling
 * - Modern UI with animations
 */
export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxFileSize = 50, // 50MB default
  acceptedTypes = ['.kml', '.kmz'],
  className
}: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: { loaded: 0, total: 0, percentage: 0 }
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Validates the selected file against size and type constraints
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `Only ${acceptedTypes.join(', ')} files are allowed`
    }

    return null
  }, [maxFileSize, acceptedTypes])

  /**
   * Handles file selection from input or drag and drop
   */
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    
    if (validationError) {
      setUploadStatus({
        status: 'error',
        progress: { loaded: 0, total: 0, percentage: 0 },
        error: validationError
      })
      onUploadError?.(validationError)
      return
    }

    setSelectedFile(file)
    setUploadStatus({
      status: 'idle',
      progress: { loaded: 0, total: 0, percentage: 0 }
    })
  }, [validateFile, onUploadError])

  /**
   * Handles the complete upload process
   */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    try {
      setUploadStatus(prev => ({ ...prev, status: 'uploading' }))

      // Step 1: Request presigned URL
      const presignedData: PresignedUrlResponse = await requestPresignedUrl(
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      )

      // Step 2: Upload file to S3
      const fileKey = await uploadFileToS3(
        selectedFile,
        presignedData.presignedUrl,
        presignedData.fields,
        (progress: UploadProgress) => {
          setUploadStatus(prev => ({ ...prev, progress }))
        }
      )

      // Step 3: Process the uploaded file
      const { analysisId } = await processKmlFile(fileKey)

      setUploadStatus(prev => ({
        ...prev,
        status: 'success',
        fileKey
      }))

      onUploadComplete?.(fileKey, analysisId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadStatus({
        status: 'error',
        progress: { loaded: 0, total: 0, percentage: 0 },
        error: errorMessage
      })
      onUploadError?.(errorMessage)
    }
  }, [selectedFile, onUploadComplete, onUploadError])

  /**
   * Handles drag and drop events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  /**
   * Handles file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  /**
   * Clears the selected file and resets status
   */
  const clearFile = useCallback(() => {
    setSelectedFile(null)
    setUploadStatus({
      status: 'idle',
      progress: { loaded: 0, total: 0, percentage: 0 }
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  /**
   * Opens the file picker dialog
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn("w-full", className)}>
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver && "border-primary bg-primary/5",
          uploadStatus.status === 'error' && "border-destructive bg-destructive/5",
          uploadStatus.status === 'success' && "border-green-500 bg-green-50",
          !selectedFile && "hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!selectedFile ? openFilePicker : undefined}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Upload Icon */}
            <motion.div
              animate={{
                scale: isDragOver ? 1.1 : 1,
                rotate: uploadStatus.status === 'uploading' ? 360 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {uploadStatus.status === 'uploading' ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : uploadStatus.status === 'success' ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : uploadStatus.status === 'error' ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
            </motion.div>

            {/* Upload Text */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {uploadStatus.status === 'success' ? 'Upload Complete!' :
                 uploadStatus.status === 'error' ? 'Upload Failed' :
                 selectedFile ? 'File Selected' : 'Upload KML File'}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {uploadStatus.status === 'success' ? 'Your KML file has been uploaded successfully' :
                 uploadStatus.status === 'error' ? uploadStatus.error :
                 selectedFile ? selectedFile.name :
                 'Drag and drop your KML file here, or click to browse'}
              </p>

              {uploadStatus.status === 'idle' && !selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Supported formats: {acceptedTypes.join(', ')} • Max size: {maxFileSize}MB
                </p>
              )}
            </div>

            {/* Selected File Info */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-md"
                >
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Progress */}
            <AnimatePresence>
              {uploadStatus.status === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-md space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadStatus.progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadStatus.progress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {!selectedFile && (
                <Button onClick={openFilePicker} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              )}
              
              {selectedFile && uploadStatus.status === 'idle' && (
                <Button onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              )}
              
              {uploadStatus.status === 'success' && (
                <Button onClick={clearFile} variant="outline">
                  Upload Another
                </Button>
              )}
              
              {uploadStatus.status === 'error' && (
                <Button onClick={clearFile} variant="outline">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
