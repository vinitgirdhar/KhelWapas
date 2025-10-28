
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Truck, Package, Calendar as CalendarIcon, User } from 'lucide-react';
import { PickupExecutive, ScheduledPickup, SellRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function PickupSchedulingPage() {
  const [date, setDate] = useState<Date | undefined>();
  const [allSellRequests, setAllSellRequests] = useState<SellRequest[]>([]);
  const [scheduledPickups, setScheduledPickups] = useState<ScheduledPickup[]>([]);
  const [availableExecutives, setAvailableExecutives] = useState<PickupExecutive[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for pickup executives
  const allPickupExecutives: PickupExecutive[] = [
    { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', area: 'South Delhi', rating: 4.8, isAvailable: true },
    { id: '2', name: 'Amit Singh', phone: '+91 98765 43211', area: 'North Delhi', rating: 4.6, isAvailable: true },
    { id: '3', name: 'Vikram Malhotra', phone: '+91 98765 43212', area: 'East Delhi', rating: 4.9, isAvailable: true },
    { id: '4', name: 'Suresh Patel', phone: '+91 98765 43213', area: 'West Delhi', rating: 4.7, isAvailable: true },
    { id: '5', name: 'Ramesh Verma', phone: '+91 98765 43214', area: 'Central Delhi', rating: 4.5, isAvailable: true },
  ];

  useEffect(() => {
    fetchSellRequests();
    setAvailableExecutives(allPickupExecutives.slice(0, 3));
  }, []);

  const fetchSellRequests = async () => {
    try {
      const response = await fetch('/api/admin/sell-requests');
      if (response.ok) {
        const data = await response.json();
        setAllSellRequests(data.sellRequests || []);
      }
    } catch (error) {
      console.error('Error fetching sell requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sell requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (request: SellRequest, executive: PickupExecutive) => {
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'No Date Selected',
        description: 'Please select a date from the calendar to assign a pickup.',
      });
      return;
    }

    // Create a new scheduled pickup
    const newPickup: ScheduledPickup = {
      orderId: request.id,
      executiveName: executive.name,
      address: `Pickup from ${request.fullName}`, // Simplified address
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
    setScheduledPickups(prevPickups => [...prevPickups, newPickup]);

    // Update the sell request status to 'Scheduled'
    // Note: This would typically call an API to update the status
    // For now, we'll just update the local state
    setAllSellRequests(prev => 
      prev.map(req => 
        req.id === request.id ? { ...req, status: 'Approved' } : req
      )
    );
    
    // Update the available executives list
    setAvailableExecutives(prevExecutives => {
        // Remove the assigned executive
        const updatedList = prevExecutives.filter(e => e.id !== executive.id);
        
        // Find a new executive to add who is not already in the list
        const nextExecutive = allPickupExecutives.find(
            exec => ![...updatedList, executive].some(e => e.id === exec.id)
        );

        if (nextExecutive) {
            updatedList.push(nextExecutive);
        }

        return updatedList;
    });

    toast({
      title: 'Pickup Scheduled',
      description: `${executive.name} has been assigned to pickup "${request.title}".`,
    });
  };

  const filteredPickups = scheduledPickups.filter(p => {
    if (!date) return true;
    const pickupDate = new Date(p.date);
    // Compare year, month, and day in UTC to avoid timezone issues
    return pickupDate.getUTCFullYear() === date.getUTCFullYear() &&
           pickupDate.getUTCMonth() === date.getUTCMonth() &&
           pickupDate.getUTCDate() === date.getUTCDate();
  });
  
  const pendingPickupRequests = allSellRequests.filter(req => req.status === 'Approved');
  
  // Create a map of dates with scheduled pickups for the calendar
  const pickupsByDate = scheduledPickups.reduce((acc, pickup) => {
    const pickupDate = new Date(pickup.date).toDateString();
    if (!acc[pickupDate]) {
        acc[pickupDate] = [];
    }
    acc[pickupDate].push(pickup);
    return acc;
  }, {} as Record<string, ScheduledPickup[]>);

  const scheduledDates = Object.keys(pickupsByDate).map(d => new Date(d));

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
         <h1 className="font-headline text-2xl font-bold">Pickup Scheduling</h1>
      </header>
      <TooltipProvider>
      <main className="flex-1 p-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            
             <div className="lg:col-span-1 space-y-8">
                {/* Pending Pickups */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Pickups</CardTitle>
                        <CardDescription>Approved requests waiting for scheduling.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-4">
                                {pendingPickupRequests.length > 0 ? (
                                    pendingPickupRequests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-background p-2 rounded-md border">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{req.title}</p>
                                                    <p className="text-xs text-muted-foreground">From: {req.fullName}</p>
                                                </div>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="secondary" size="sm">Schedule</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="grid gap-4">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium leading-none">Assign Executive</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Select an executive for this pickup.
                                                            </p>
                                                        </div>
                                                        <div className="grid gap-2">
                                                           {availableExecutives.map(exec => (
                                                               <Button key={exec.id} variant="outline" size="sm" className="justify-start gap-2" onClick={() => handleAssign(req, exec)}>
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={exec.avatar} alt={exec.name} />
                                                                        <AvatarFallback>{exec.name.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    {exec.name}
                                                               </Button>
                                                           ))}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No pending pickups.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Available Executives */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Executives</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {availableExecutives.map((exec) => (
                            <div key={exec.id} className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={exec.avatar} alt={exec.name} />
                                    <AvatarFallback>{exec.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{exec.name}</p>
                                    <p className="text-sm text-muted-foreground">{exec.location}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Calendar & Scheduled Pickups */}
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pickup Calendar</CardTitle>
                        <CardDescription>Hover over a highlighted date for a quick summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            className="p-0"
                            modifiers={{ scheduled: scheduledDates }}
                            modifiersClassNames={{ scheduled: "font-bold text-primary" }}
                             components={{
                                DayContent: ({ date }) => {
                                const pickups = pickupsByDate[date.toDateString()];
                                const hasPickups = pickups && pickups.length > 0;
                                return (
                                    <div className="relative">
                                    {hasPickups ? (
                                        <Tooltip>
                                        <TooltipTrigger className="w-full h-full flex items-center justify-center">
                                            <span className="relative">
                                                {date.getDate()}
                                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{pickups.length} pickup{pickups.length > 1 ? 's' : ''} scheduled:</p>
                                            <ul className="list-disc list-inside">
                                            {pickups.map(p => <li key={p.orderId}>{p.executiveName}</li>)}
                                            </ul>
                                        </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        date.getDate()
                                    )}
                                    </div>
                                );
                                },
                            }}
                         />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled Pickups</CardTitle>
                        <CardDescription>
                            Showing pickups for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'all dates'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {filteredPickups.length > 0 ? (
                            filteredPickups.map((pickup) => (
                                <div key={pickup.orderId} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="bg-background p-3 rounded-md border">
                                        <Truck className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Pickup for Request #{pickup.orderId.split('-')[1]}</p>
                                        <p className="text-sm text-muted-foreground">Executive: {pickup.executiveName}</p>
                                        <p className="text-sm text-muted-foreground">Address: {pickup.address}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center text-muted-foreground py-8">
                                <p>No pickups scheduled for this date.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      </TooltipProvider>
    </div>
  );
}
