'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Request = {
  id: string
  title: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/sell-requests')
        const data = await res.json()
        if (data.success) {
          setRequests(data.sellRequests)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main className="flex-1 p-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Sell Requests</CardTitle>
          <CardDescription>All user submitted sell requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No requests found.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{req.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{req.status}</Badge>
                    <Button asChild size="sm"><Link href={`/admin/requests/${req.id}`}>View</Link></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
