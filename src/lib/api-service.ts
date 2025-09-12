/**
 * API service for handling presigned URL requests and file uploads
 * This service handles backend API calls for KML file upload functionality
 */

// Types for API responses
export interface PresignedUrlResponse {
    presignedUrl: string
    fileKey: string
    expiresIn: number
    fields?: Record<string, string>
}

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

export interface UploadStatus {
    status: 'idle' | 'uploading' | 'success' | 'error'
    progress: UploadProgress
    error?: string
    fileKey?: string
}

/**
 * API call to request a presigned URL for file upload from backend Lambda function
 * 
 * @param fileName - The name of the file to upload
 * @param fileType - The MIME type of the file
 * @param fileSize - The size of the file in bytes
 * @returns Promise<PresignedUrlResponse> - The presigned URL and metadata
 */
export async function requestPresignedUrl(
    fileName: string,
    fileType: string,
    fileSize: number
): Promise<PresignedUrlResponse> {
    // Client-side validation - reject files that are too large or wrong type
    if (fileSize > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('File size exceeds 50MB limit')
    }

    if (!fileType.includes('application/vnd.google-earth.kml') &&
        !fileType.includes('application/vnd.google-earth.kmz') &&
        !fileName.toLowerCase().endsWith('.kml') &&
        !fileName.toLowerCase().endsWith('.kmz')) {
        throw new Error('Only KML and KMZ files are allowed')
    }

    try {
        const response = await fetch('/api/presigned-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: `input_kml_files/${fileName}`
            })
        })

        if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Log the response for debugging
        console.log('API response data:', data)

        // Check if presignedUrl exists in the response
        if (!data.presignedUrl) {
            console.error('Missing presignedUrl in response:', data)
            throw new Error('Invalid response from server: missing presignedUrl')
        }

        // Return the response from the backend
        return {
            presignedUrl: data.presignedUrl,
            fileKey: data.fileKey || `kml-uploads/${Date.now()}-${fileName}`,
            expiresIn: data.expiresIn || 3600,
            fields: data.fields || {
                'Content-Type': fileType,
                'x-amz-meta-original-name': fileName,
                'x-amz-meta-upload-timestamp': Date.now().toString()
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            // Check for CORS errors specifically
            if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
                throw new Error('CORS Error: The server is returning duplicate CORS headers. Please fix the backend Lambda function to return only one Access-Control-Allow-Origin header.')
            }
            throw new Error(`Failed to request presigned URL: ${error.message}`)
        }
        throw new Error('Failed to request presigned URL: Unknown error')
    }
}

/**
 * Upload file to S3 using presigned URL
 * In a real application, this would upload to actual S3
 * 
 * @param file - The file to upload
 * @param presignedUrl - The presigned URL for upload
 * @param fields - Additional form fields for the upload
 * @param onProgress - Callback for upload progress updates
 * @returns Promise<string> - The file key after successful upload
 */
export async function uploadFileToS3(
    file: File,
    presignedUrl: string,
    fields: Record<string, string> = {},
    onProgress?: (progress: UploadProgress) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress: UploadProgress = {
                    loaded: event.loaded,
                    total: event.total,
                    percentage: Math.round((event.loaded / event.total) * 100)
                }
                onProgress(progress)
            }
        })

        // Handle successful upload
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Extract file key from the presigned URL or use a mock one
                const fileKey = presignedUrl.split('/').pop()?.split('?')[0] || `input_kml_files/${Date.now()}-${file.name}`
                resolve(fileKey)
            } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`))
            }
        })

        // Handle upload errors
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed due to network error'))
        })

        // Handle upload timeout
        xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timed out'))
        })

        // Set up the request
        xhr.open('PUT', presignedUrl)

        // Don't set any custom headers to avoid CORS preflight
        // Let S3 handle everything automatically

        // Set timeout (30 seconds)
        xhr.timeout = 30000

        // Start the upload
        xhr.send(file)
    })
}

/**
 * Mock API call to process uploaded KML file
 * In a real application, this would trigger backend processing
 * 
 * @param fileKey - The S3 key of the uploaded file
 * @returns Promise<{ analysisId: string }> - The analysis ID for tracking
 */
export async function processKmlFile(fileKey: string): Promise<{ analysisId: string }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock analysis ID
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return { analysisId }
}

/**
 * Mock API call to get analysis status
 * In a real application, this would check the actual processing status
 * 
 * @param analysisId - The analysis ID to check
 * @returns Promise<{ status: string, progress: number }> - Analysis status and progress
 */
export async function getAnalysisStatus(analysisId: string): Promise<{ status: string, progress: number }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock status progression
    const statuses = ['queued', 'processing', 'analyzing', 'completed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const progress = randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 90) + 10

    return { status: randomStatus, progress }
}
