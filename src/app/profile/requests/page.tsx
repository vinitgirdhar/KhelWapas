'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Request = {
  id: string
  reviewReason?: string
  product?: { id: string; isAvailable: boolean; stock: number }
  title: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export default function ProfileSellRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/profile/sell-requests')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Could not load requests')
        if (data.success) setRequests(data.sellRequests)
      } catch(e) { setError((e as Error).message) } finally {
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
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No requests yet.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-start justify-between gap-3 border rounded-xl p-4">
                <div className="min-w-0 flex-1 basis-40 break-words">
                  <div className="font-medium">{req.title}</div>
                  {req.reviewReason && <p className="mt-1 text-sm text-muted-foreground">Review note: {req.reviewReason}</p>}
                  {req.product && <Link href={`/products/${req.product.id}`} className="text-sm text-primary underline">{req.product.stock > 0 ? 'View your listing' : 'Sold · View listing'}</Link>}
                  <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</div>
                </div>
                <Badge variant="outline" className="shrink-0">{req.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
