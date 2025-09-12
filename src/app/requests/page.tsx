'use client'

import React, { useState } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { AddNewRequestForm } from '@/components/forms/add-new-request-form'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface Request {
  id: string
  clientName: string
  email: string
  dateReceived: string
  kmlFiles: string
}

const mockRequests: Request[] = [
  {
    id: 'R00001',
    clientName: 'Client A',
    email: 'alexander.louis@example.com',
    dateReceived: '11-01-2025',
    kmlFiles: 'View/Edit'
  },
  {
    id: 'R00002',
    clientName: 'Client B',
    email: 'michael.henry@example.com',
    dateReceived: '14-06-2025',
    kmlFiles: 'View/Edit'
  },
  {
    id: 'R00003',
    clientName: 'Client C',
    email: 'stephen.lara@example.com',
    dateReceived: '24-01-2025',
    kmlFiles: 'View/Edit'
  },
  {
    id: 'R00004',
    clientName: 'Client D',
    email: 'christoper.john@example.com',
    dateReceived: '17-02-2025',
    kmlFiles: 'View/Edit'
  },
  {
    id: 'R00005',
    clientName: 'Client E',
    email: 'lara.olive@example.com',
    dateReceived: '14-03-2025',
    kmlFiles: 'View/Edit'
  }
]

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [requests] = useState<Request[]>(mockRequests)

  const filteredRequests = requests.filter(request =>
    request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Requests</h1>
                <p className="text-gray-600">Check all the requests received from clients in this table</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  Add New Request
                </Button>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Request ID</TableHead>
                    <TableHead className="font-semibold">Client Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Date Received</TableHead>
                    <TableHead className="font-semibold">KML Files</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.clientName}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.dateReceived}</TableCell>
                      <TableCell>
                        <a href={`/view-kml/${request.id}`} className="text-blue-600 hover:text-blue-800">
                          {request.kmlFiles}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Add New Request Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New"
        >
          <AddNewRequestForm onClose={() => setIsAddModalOpen(false)} />
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
