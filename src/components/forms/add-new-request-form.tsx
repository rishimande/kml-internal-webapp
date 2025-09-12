'use client'

import { useState } from 'react'
import { Upload, Cloud, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface AddNewRequestFormProps {
  onClose: () => void
}

export function AddNewRequestForm({ onClose }: AddNewRequestFormProps) {
  const [formData, setFormData] = useState({
    requestId: '',
    clientName: '',
    receivedOn: '',
    location: '',
    registry: '',
    projectType: '',
    folderName: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primary Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="requestId" className="block text-sm font-medium text-gray-700 mb-2">
            Request ID
          </label>
          <Input
            id="requestId"
            name="requestId"
            value={formData.requestId}
            onChange={handleChange}
            placeholder="Enter Request ID"
            required
          />
        </div>
        
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
            Client Name
          </label>
          <Input
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Enter Client Name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="receivedOn" className="block text-sm font-medium text-gray-700 mb-2">
            Received On
          </label>
          <Input
            id="receivedOn"
            name="receivedOn"
            type="date"
            value={formData.receivedOn}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Cloud className="h-12 w-12 text-gray-400" />
            <Image className="h-6 w-6 text-gray-400 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Browse and Upload KML Files</p>
            <p className="text-sm text-gray-500 mt-1">Drag and drop files here or click to browse</p>
          </div>
          <Button type="button" variant="outline" className="mt-4">
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Additional Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter Location"
            />
          </div>
          
          <div>
            <label htmlFor="registry" className="block text-sm font-medium text-gray-700 mb-2">
              Registry
            </label>
            <Input
              id="registry"
              name="registry"
              value={formData.registry}
              onChange={handleChange}
              placeholder="Enter Registry"
            />
          </div>
          
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <Input
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              placeholder="Enter Project Type"
            />
          </div>
          
          <div>
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
              Select Folder Name
            </label>
            <Input
              id="folderName"
              name="folderName"
              value={formData.folderName}
              onChange={handleChange}
              placeholder="Enter Folder Name"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Save
        </Button>
      </div>
    </form>
  )
}
