import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const presignedUrl = formData.get('presignedUrl') as string

        if (!file || !presignedUrl) {
            return NextResponse.json(
                { error: 'File and presignedUrl are required' },
                { status: 400 }
            )
        }

        // Upload file to S3 using the presigned URL
        const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            }
        })

        if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed: ${uploadResponse.status}`)
        }

        // Extract file key from presigned URL
        const fileKey = presignedUrl.split('/').pop()?.split('?')[0] || `input_kml_files/${Date.now()}-${file.name}`

        return NextResponse.json({
            success: true,
            fileKey,
            message: 'File uploaded successfully'
        })

    } catch (error) {
        console.error('Upload proxy error:', error)
        return NextResponse.json(
            { error: 'Upload failed' },
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
