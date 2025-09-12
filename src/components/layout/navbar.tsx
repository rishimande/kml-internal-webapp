'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/requests" className="text-xl font-bold">
              KML Webapp
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/requests">
              <Button variant="ghost">Requests</Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/kml-analysis-demo">
              <Button variant="ghost">KML Demo</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
