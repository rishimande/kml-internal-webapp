'use client'

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, CheckSquare, Download, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface ViewKMLPageProps {
  params: {
    id: string
  }
}

export default function ViewKMLPage({ params }: ViewKMLPageProps) {
  const [selectedProjectType, setSelectedProjectType] = useState('')
  const [selectedRegistry, setSelectedRegistry] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">Editor</span>
          </div>
          
          <nav className="space-y-2">
            <a href="/requests" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
              <span>Requests</span>
            </a>
            <a href="/projects" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
              <span>Projects</span>
            </a>
            <a href="/kml-analysis-demo" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
              <span>KML Demo</span>
            </a>
            <a href="/settings" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Request ID | Client Name</h1>
          </div>

          {/* Control Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="w-48">
              <Select
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value)}
              >
                <option value="">Project Type</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </Select>
            </div>
            
            <div className="w-48">
              <Select
                value={selectedRegistry}
                onChange={(e) => setSelectedRegistry(e.target.value)}
              >
                <option value="">Registry</option>
                <option value="registry1">Registry 1</option>
                <option value="registry2">Registry 2</option>
              </Select>
            </div>
            
            <Button className="bg-purple-600 hover:bg-purple-700">
              View Checklist
            </Button>
            
            <div className="w-48">
              <Select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">Select Folder</option>
                <option value="folder1">Folder 1</option>
                <option value="folder2">Folder 2</option>
              </Select>
            </div>
            
            <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit KML
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Checklist */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <CheckSquare className="h-16 w-16 text-gray-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Checklist</h3>
                <p className="text-gray-600">Select filters to view checklist</p>
              </div>
            </div>

            {/* Right Panel - KML Preview */}
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
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
