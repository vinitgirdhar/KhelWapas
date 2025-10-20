'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  CreditCard,
  User,
  Calendar,
  Clock,
  Download,
  Printer,
  MessageSquare,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partially_paid';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderDetails {
  id: string;
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    totalOrders: number;
    status: string;
  };
  items: OrderItem[];
  amount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderDate: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  adminNotes?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

const statusConfig: Record<OrderStatus, { color: string; icon: React.ReactNode }> = {
  Pending: { 
    color: 'text-yellow-800 bg-yellow-100',
    icon: <Clock className="h-4 w-4" />
  },
  Confirmed: { 
    color: 'text-blue-800 bg-blue-100',
    icon: <CheckCircle className="h-4 w-4" />
  },
  Shipped: { 
    color: 'text-indigo-800 bg-indigo-100',
    icon: <Truck className="h-4 w-4" />
  },
  Delivered: { 
    color: 'text-green-800 bg-green-100',
    icon: <Package className="h-4 w-4" />
  },
  Cancelled: { 
    color: 'text-red-800 bg-red-100',
    icon: <XCircle className="h-4 w-4" />
  },
  Returned: { 
    color: 'text-gray-800 bg-gray-100',
    icon: <RefreshCw className="h-4 w-4" />
  },
};

const paymentStatusConfig: Record<PaymentStatus, string> = {
  paid: 'text-green-800 bg-green-100',
  pending: 'text-yellow-800 bg-yellow-100',
  refunded: 'text-red-800 bg-red-100',
  partially_paid: 'text-orange-800 bg-orange-100',
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.orderId as string;

  const [order, setOrder] = React.useState<OrderDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = React.useState(false);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<OrderStatus>('Pending');
  const [note, setNote] = React.useState('');
  const [adminNote, setAdminNote] = React.useState('');

  React.useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setNewStatus(data.order.orderStatus);
        setAdminNote(data.order.adminNotes || '');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load order details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: note }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Order cancelled successfully',
        });
        setCancelDialogOpen(false);
        fetchOrderDetails();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to cancel order',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Order status updated successfully',
        });
        setUpdateStatusDialogOpen(false);
        fetchOrderDetails();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNote }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Note added successfully',
        });
        setAddNoteDialogOpen(false);
        fetchOrderDetails();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to add note',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.open(`/invoice/${orderId}`, '_blank');
  };

  const handleExportPDF = async () => {
    toast({
      title: 'Exporting...',
      description: 'Generating PDF...',
    });
    // PDF export functionality would go here
  };

  const handleSendInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/send-invoice`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Invoice sent to customer',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send invoice',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Order not found</p>
        <Button onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = 50; // Flat shipping

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">
              {order.orderId} • {format(new Date(order.orderDate), 'PPp')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setUpdateStatusDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={statusConfig[order.orderStatus].color}>
          {statusConfig[order.orderStatus].icon}
          <span className="ml-2">{order.orderStatus}</span>
        </Badge>
        <Badge variant="outline" className={paymentStatusConfig[order.paymentStatus]}>
          <CreditCard className="mr-2 h-4 w-4" />
          {order.paymentStatus.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST 18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.amount.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Delivery */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Tracking Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tracking Number:</span>
                          <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                        {order.courierName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Courier:</span>
                            <span>{order.courierName}</span>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Delivery:</span>
                            <span>{format(new Date(order.estimatedDelivery), 'PPP')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {index < order.timeline.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(order.notes || order.adminNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Customer Notes</h4>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
                {order.adminNotes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
                    <p className="text-sm text-muted-foreground">{order.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={order.customer.profilePicture} />
                  <AvatarFallback>
                    {order.customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer.totalOrders} orders
                  </p>
                </div>
              </div>
              
              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${order.customer.email}`} className="hover:underline">
                    {order.customer.email}
                  </a>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${order.customer.phone}`} className="hover:underline">
                      {order.customer.phone}
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/admin/users/${order.customer.id}`)}
              >
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={paymentStatusConfig[order.paymentStatus]}>
                  {order.paymentStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">₹{order.amount.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setUpdateStatusDialogOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Update Status
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleSendInvoice}
              >
                <FileText className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setAddNoteDialogOpen(true)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Note
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = `mailto:${order.customer.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Customer
              </Button>
              {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter reason for cancellation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order to reflect its current state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Note</DialogTitle>
            <DialogDescription>
              Add an internal note to this order. This will not be visible to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-note">Note</Label>
              <Textarea
                id="admin-note"
                placeholder="Enter admin note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
