
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Address } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AddressDialog } from '@/components/profile/address-dialog';

export default function AddressesPage() {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    useEffect(() => {
        const storedAddresses = localStorage.getItem('userAddresses');
        if (storedAddresses) {
            setAddresses(JSON.parse(storedAddresses));
        } else {
            // Initialize with empty array if no addresses stored
            setAddresses([]);
        }
    }, []);

    const updateLocalStorage = (updatedAddresses: Address[]) => {
        localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        setAddresses(updatedAddresses);
    };
    
    const handleSaveAddress = (address: Address) => {
        let updatedAddresses;
        if (addresses.some(a => a.id === address.id)) {
            // Update existing address
            updatedAddresses = addresses.map(a => a.id === address.id ? address : a);
             toast({ title: 'Address Updated', description: 'Your address has been updated.' });
        } else {
            // Add new address
            updatedAddresses = [...addresses, address];
            toast({ title: 'Address Added', description: 'A new address has been added.' });
        }
        
        if (address.isDefault) {
            updatedAddresses = updatedAddresses.map(a => ({...a, isDefault: a.id === address.id}))
        }

        updateLocalStorage(updatedAddresses);
        setIsDialogOpen(false);
    };


    const handleDeleteAddress = (id: string) => {
        const updatedAddresses = addresses.filter(address => address.id !== id);
        updateLocalStorage(updatedAddresses);
        toast({ variant: 'destructive', title: 'Address Removed', description: 'The address has been removed.' });
    };

    const handleOpenDialog = (address: Address | null = null) => {
        setSelectedAddress(address);
        setIsDialogOpen(true);
    };

  return (
      <>
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle>My Addresses</CardTitle>
                <CardDescription>
                    Manage your saved shipping addresses.
                </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4"/>
                Add New Address
            </Button>
        </CardHeader>
        <CardContent>
            {addresses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
                <p>You have no saved addresses.</p>
            </div>
            ) : (
            <div className="space-y-4">
                {addresses.map((address) => (
                <div key={address.id} className="p-4 border rounded-lg flex justify-between items-start">
                    <div>
                    <div className="flex items-center gap-3">
                        <p className="font-semibold">{address.title}</p>
                        {address.isDefault && (
                            <Badge>Default</Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        {address.fullName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {address.street}, {address.city}, {address.state} - {address.postalCode}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Phone: {address.phone}
                    </p>
                    </div>
                    <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={() => handleOpenDialog(address)}>
                        Edit
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteAddress(address.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Address</span>
                    </Button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </CardContent>
        </Card>
        <AddressDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSaveAddress}
            address={selectedAddress}
        />
    </>
  );
}
