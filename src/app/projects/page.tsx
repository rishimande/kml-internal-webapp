'use client'

import { useState } from 'react'
import { Search, MoreVertical, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface Project {
  id: string
  name: string
  description: string
  status: 'Active' | 'Completed' | 'Pending'
  lastModified: string
  requestCount: number
}

const mockProjects: Project[] = [
  {
    id: 'P001',
    name: 'Urban Planning Project',
    description: 'KML files for urban development planning',
    status: 'Active',
    lastModified: '2025-01-15',
    requestCount: 12
  },
  {
    id: 'P002',
    name: 'Environmental Survey',
    description: 'Environmental impact assessment KML data',
    status: 'Completed',
    lastModified: '2025-01-10',
    requestCount: 8
  },
  {
    id: 'P003',
    name: 'Infrastructure Mapping',
    description: 'Infrastructure development mapping project',
    status: 'Pending',
    lastModified: '2025-01-08',
    requestCount: 5
  },
  {
    id: 'P004',
    name: 'Land Use Analysis',
    description: 'Comprehensive land use analysis project',
    status: 'Active',
    lastModified: '2025-01-12',
    requestCount: 15
  }
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [projects] = useState<Project[]>(mockProjects)

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
            <a href="/requests" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
              <span>Requests</span>
            </a>
            <a href="/projects" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-gray-600">Manage and organize your KML projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button>
                New Project
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Folder className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-gray-500">ID: {project.id}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {project.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Requests:</span>
                      <span className="text-sm font-medium">{project.requestCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Modified:</span>
                      <span className="text-sm font-medium">{project.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
