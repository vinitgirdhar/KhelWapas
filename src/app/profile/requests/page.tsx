'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Request = {
  id: string
  title: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export default function ProfileSellRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/profile/sell-requests')
        const data = await res.json()
        if (data.success) setRequests(data.sellRequests)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell Requests</CardTitle>
        <CardDescription>Your submitted sale requests and status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No requests yet.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{req.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</div>
                </div>
                <Badge variant="outline">{req.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
