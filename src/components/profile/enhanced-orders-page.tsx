'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MoreHorizontal, 
  FileText, 
  Truck, 
  Package, 
  Eye,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react';
import { Order } from '@/types/user';

const statusConfig: Record<Order['status'], { color: string, text: string, icon: React.ReactNode }> = {
  delivered: { 
    color: "bg-green-500", 
    text: "text-green-800 bg-green-100",
    icon: <Package className="h-3 w-3" />
  },
  processing: { 
    color: "bg-yellow-500", 
    text: "text-yellow-800 bg-yellow-100",
    icon: <Clock className="h-3 w-3" />
  },
  cancelled: { 
    color: "bg-red-500", 
    text: "text-red-800 bg-red-100",
    icon: <Package className="h-3 w-3" />
  },
  pending: { 
    color: "bg-blue-500", 
    text: "text-blue-800 bg-blue-100",
    icon: <Clock className="h-3 w-3" />
  },
  shipped: { 
    color: "bg-purple-500", 
    text: "text-purple-800 bg-purple-100",
    icon: <Truck className="h-3 w-3" />
  },
};

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function OrderDetailsDialog({ order, isOpen, onClose }: OrderDetailsDialogProps) {
  if (!order) return null;

  const config = statusConfig[order.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Details
            <Badge className={config.text}>
              {config.icon}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} • Placed on {new Date(order.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Number</p>
                <p className="font-medium">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={config.text}>
                  {config.icon}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">₹{order.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Information
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">
                123 Main Street<br />
                Mumbai, Maharashtra 400001<br />
                India<br />
                Phone: +91 9876543210
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Payment Method</span>
                <span className="font-medium">Visa ending in 1234</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Payment Status</span>
                <Badge variant="outline">Paid</Badge>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.status !== 'cancelled' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {['processing', 'shipped', 'delivered'].includes(order.status) && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Confirmed</p>
                        <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                      </div>
                    </div>
                  )}
                  {['shipped', 'delivered'].includes(order.status) && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-sm text-muted-foreground">Your order is on the way</p>
                      </div>
                    </div>
                  )}
                  {order.status === 'delivered' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Delivered</p>
                        <p className="text-sm text-muted-foreground">Your order has been delivered</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnhancedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // In a real app, this would be an API call
      // For demo, we'll use mock data
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'KW-2024-001',
          date: '2024-01-15T10:30:00Z',
          status: 'delivered',
          total: 2999,
          items: [
            {
              id: '1',
              name: 'Professional Cricket Bat',
              quantity: 1,
              price: 2999,
              image: '/images/products/background.jpg'
            }
          ]
        },
        {
          id: '2',
          orderNumber: 'KW-2024-002',
          date: '2024-01-18T14:20:00Z',
          status: 'shipped',
          total: 1599,
          items: [
            {
              id: '2',
              name: 'Tennis Racket',
              quantity: 1,
              price: 1599,
              image: '/images/products/background.jpg'
            }
          ]
        },
        {
          id: '3',
          orderNumber: 'KW-2024-003',
          date: '2024-01-20T09:15:00Z',
          status: 'processing',
          total: 899,
          items: [
            {
              id: '3',
              name: 'Badminton Shuttlecocks (Pack of 12)',
              quantity: 2,
              price: 449,
              image: '/images/products/background.jpg'
            }
          ]
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDownloadInvoice = (order: Order) => {
    // In a real app, this would trigger invoice download
    window.open(`/invoice/${order.id}`, '_blank');
  };

  const handleTrackOrder = (order: Order) => {
    // In a real app, this would open tracking page
    console.log('Track order:', order.orderNumber);
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View and manage your order history and track current orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No orders yet</p>
              <p>When you place orders, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const config = statusConfig[order.status];
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">#{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={config.text}>
                              {config.icon}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item, index) => (
                                <img
                                  key={index}
                                  src={item.image}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                                />
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">₹{order.total.toLocaleString()}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Download Invoice
                                </DropdownMenuItem>
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <DropdownMenuItem onClick={() => handleTrackOrder(order)}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Track Order
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {orders.map((order) => {
                  const config = statusConfig[order.status];
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={config.text}>
                            {config.icon}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 2).map((item, index) => (
                              <img
                                key={index}
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 rounded-full border-2 border-background object-cover"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="font-medium text-lg">₹{order.total.toLocaleString()}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
