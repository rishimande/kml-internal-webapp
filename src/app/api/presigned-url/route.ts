import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { fileName } = await request.json()

        if (!fileName) {
            return NextResponse.json(
                { error: 'fileName is required' },
                { status: 400 }
            )
        }

        // Make the request to your Lambda function
        const response = await fetch('https://d356av4sajwc2nzt2zi62sjoyq0oimyh.lambda-url.ap-south-1.on.aws/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: fileName // fileName now includes the input_kml_files/ prefix
            })
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Lambda function returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()

        // Log the response for debugging
        console.log('Lambda function response:', data)
        console.log('Lambda fileKey:', data.fileKey)
        console.log('Lambda uploadUrl:', data.uploadUrl)

        // Check if the response has the expected format
        if (!data.uploadUrl) {
            console.warn('Lambda function did not return uploadUrl, using fallback')

            // Fallback response for testing
            const fallbackData = {
                presignedUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fileName}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock&X-Amz-Date=${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=mock`,
                fileKey: `${fileName}`,
                expiresIn: 3600,
                fields: {
                    'Content-Type': 'application/vnd.google-earth.kml',
                    'x-amz-meta-original-name': fileName.split('/').pop() || fileName,
                    'x-amz-meta-upload-timestamp': Date.now().toString()
                }
            }

            return NextResponse.json(fallbackData, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            })
        }

        // Transform the Lambda response to match expected format
        const transformedData = {
            presignedUrl: data.uploadUrl,
            fileKey: data.fileKey || `${fileName}`,
            expiresIn: data.expiresIn || 3600,
            fields: data.fields || {
                'x-amz-meta-original-name': fileName.split('/').pop() || fileName, // Extract just the filename for metadata
                'x-amz-meta-upload-timestamp': Date.now().toString()
            }
        }

        // Return the transformed response with proper CORS headers
        return NextResponse.json(transformedData, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        })

    } catch (error) {
        console.error('Error in presigned URL proxy:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
