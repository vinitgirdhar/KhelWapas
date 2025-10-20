
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Search,
  File,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { type Order } from '@/types/user';
import { format } from 'date-fns';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

const statusConfig: Record<OrderStatus, string> = {
    Pending: 'text-yellow-800 bg-yellow-100',
    Confirmed: 'text-blue-800 bg-blue-100',
    Shipped: 'text-indigo-800 bg-indigo-100',
    Delivered: 'text-green-800 bg-green-100',
    Cancelled: 'text-red-800 bg-red-100',
    Returned: 'text-gray-800 bg-gray-100',
};

const pickupStatusConfig: Record<Order['pickupStatus'], string> = {
    Pending: 'text-yellow-800 bg-yellow-100',
    Scheduled: 'text-blue-800 bg-blue-100',
    'In Progress': 'text-indigo-800 bg-indigo-100',
    Completed: 'text-green-800 bg-green-100',
};

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<OrderStatus | 'all'>('all');
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch orders from API
    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders', {
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                console.log('Orders API response:', data); // Debug log
                if (data.success && data.orders) {
                    console.log(`Loaded ${data.orders.length} orders`); // Debug log
                    setOrders(data.orders);
                } else {
                    console.error('Failed to load orders:', data.message);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = React.useMemo(() => {
        let filtered = orders;

        if (activeTab !== 'all') {
            filtered = filtered.filter(o => o.orderStatus === activeTab);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(o => 
                o.orderId.toLowerCase().includes(term) ||
                o.customer.name.toLowerCase().includes(term) ||
                o.product.name.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [orders, searchTerm, activeTab]);
    
    const handleExport = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        
        // Add logo (assuming it's in public/images/logo.png)
        // You might need to adjust the path or use a base64 string
        // For this example, I'm using a placeholder as direct FS access isn't feasible here.
        // In a real app, you'd fetch the image and convert it.
        const logoImg = new Image();
        logoImg.src = '/images/logo.png';
        
        doc.setFontSize(20);
        doc.text("Khelwapas Orders Report", 14, 22);
        
        const tableColumn = ["Order ID", "Customer", "Status", "Pickup", "Date", "Amount"];
        const tableRows: (string | number)[][] = [];

        filteredOrders.forEach(order => {
            const orderData = [
                order.orderId,
                order.customer.name,
                order.orderStatus,
                order.pickupStatus,
                format(new Date(order.orderDate), "PP"),
                `₹${order.amount.toLocaleString('en-IN')}`
            ];
            tableRows.push(orderData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save("khelwapas-orders.pdf");
    };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading orders...</div>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as OrderStatus | 'all')}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Shipped">Shipped</TabsTrigger>
            <TabsTrigger value="Delivered">Delivered</TabsTrigger>
            <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
          </TabsList>
           <div className="ml-auto flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search orders..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExport}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
            <OrdersTable orders={filteredOrders} />
        </TabsContent>
        <TabsContent value="Pending">
            <OrdersTable orders={filteredOrders} />
        </TabsContent>
         <TabsContent value="Shipped">
            <OrdersTable orders={filteredOrders} />
        </TabsContent>
         <TabsContent value="Delivered">
            <OrdersTable orders={filteredOrders} />
        </TabsContent>
         <TabsContent value="Cancelled">
            <OrdersTable orders={filteredOrders} />
        </TabsContent>
      </Tabs>
      )}
    </main>
  );
}


function OrdersTable({ orders }: { orders: Order[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const canCancel = (status: OrderStatus) => !['Delivered', 'Cancelled', 'Returned'].includes(status);
    const canUpdateStatus = (status: OrderStatus) => !['Cancelled', 'Returned'].includes(status);

    const handleViewDetails = (orderId: string) => {
        router.push(`/admin/orders/${orderId}`);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Cancelled by admin' }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Order cancelled successfully',
                });
                // Refresh the page
                window.location.reload();
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

    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>
                        A list of all orders on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground">No orders found.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Orders will appear here once customers place them.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
         <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              A list of all orders on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Pickup</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {order.customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[order.orderStatus]}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                       <Badge variant="outline" className={pickupStatusConfig[order.pickupStatus]}>
                        {order.pickupStatus}
                       </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(order.orderDate), "PPpp")}
                    </TableCell>
                    <TableCell className="text-right">₹{order.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(order.orderId)}>
                            View Details
                          </DropdownMenuItem>
                          {canUpdateStatus(order.orderStatus) && (
                            <DropdownMenuItem onClick={() => handleViewDetails(order.orderId)}>
                              Update Status
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => window.open(`/invoice/${order.orderId}`, '_blank')}>
                            Print Invoice
                          </DropdownMenuItem>
                          {canCancel(order.orderStatus) && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelOrder(order.orderId)}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{orders.length}</strong> of <strong>{orders.length}</strong> orders
            </div>
          </CardFooter>
        </Card>
    );
}
