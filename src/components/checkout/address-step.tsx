
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, MapPin } from 'lucide-react';
import { Address } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { AddressDialog } from '@/components/profile/address-dialog';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface AddressStepProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
}

export default function AddressStep({ selectedAddress, onSelectAddress }: AddressStepProps) {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedAddresses = localStorage.getItem('userAddresses');
        const loadedAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
        setAddresses(loadedAddresses);

        // Auto-select the default address initially if no address is already selected
        if (!selectedAddress && loadedAddresses.length > 0) {
            const defaultAddress = loadedAddresses.find((a: Address) => a.isDefault);
            if (defaultAddress) {
                onSelectAddress(defaultAddress);
            }
        }
        setIsLoading(false);
    }, []); // Removed dependencies to only run once on mount

    const updateLocalStorage = (updatedAddresses: Address[]) => {
        localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        setAddresses(updatedAddresses);
    };
    
    const handleSaveAddress = (address: Address) => {
        let updatedAddresses;
        if (addresses.some(a => a.id === address.id)) {
            updatedAddresses = addresses.map(a => a.id === address.id ? address : a);
            toast({ title: 'Address Updated' });
        } else {
            updatedAddresses = [...addresses, address];
            toast({ title: 'Address Added' });
        }
        
        if (address.isDefault) {
            updatedAddresses = updatedAddresses.map(a => ({...a, isDefault: a.id === address.id}));
        }

        updateLocalStorage(updatedAddresses);
        setIsDialogOpen(false);
        onSelectAddress(address); // Select the newly added/edited address
    };

    const handleOpenDialog = (address: Address | null = null) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

  return (
      <>
        <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</div>
            <div>
                <h2 className="font-headline text-2xl font-semibold">Shipping Address</h2>
                <p className="text-muted-foreground">Choose where you'd like your order delivered.</p>
            </div>
        </div>
        
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <div className="space-y-4">
                {addresses.map((address) => (
                <div
                    key={address.id}
                    className={cn(
                    "p-4 border rounded-lg flex justify-between items-start cursor-pointer transition-all",
                    selectedAddress?.id === address.id ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
                    )}
                    onClick={() => onSelectAddress(address)}
                >
                    <div className="flex gap-4">
                        <MapPin className={cn("h-6 w-6 mt-1 flex-shrink-0", selectedAddress?.id === address.id ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <div className="flex items-center gap-3">
                                <p className="font-semibold">{address.name}</p>
                                {address.isDefault && ( <Badge variant="secondary">Default</Badge> )}
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                {address.street}, {address.city}, {address.state} - {address.zip}
                            </p>
                            <p className="text-muted-foreground text-sm">Phone: {address.phone}</p>
                        </div>
                    </div>
                    {selectedAddress?.id === address.id && (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    )}
                </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add New Address
                </Button>
            </div>
        )}

        <AddressDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSaveAddress}
            address={editingAddress}
        />
    </>
  );
}
