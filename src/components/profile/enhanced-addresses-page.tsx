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
import { Plus, Trash2, Edit, MapPin, Phone, Home } from 'lucide-react';
import { Address } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AddressDialog } from '@/components/profile/address-dialog-new';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EnhancedAddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; address: Address | null }>({
    isOpen: false,
    address: null,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    // In a real app, this would be an API call
    const storedAddresses = localStorage.getItem('userAddresses');
    if (storedAddresses) {
      setAddresses(JSON.parse(storedAddresses));
    } else {
      // Initialize with demo data
      const demoAddresses: Address[] = [
        {
          id: '1',
          userId: 'demo-user-1',
          title: 'Home',
          fullName: 'Rohan Sharma',
          phone: '9876543210',
          street: '123, Main Street, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400058',
          country: 'India',
          isDefault: true,
        },
        {
          id: '2',
          userId: 'demo-user-1',
          title: 'Office',
          fullName: 'Rohan Sharma',
          phone: '9876543210',
          street: '456, Business Park, Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India',
          isDefault: false,
        },
      ];
      setAddresses(demoAddresses);
      localStorage.setItem('userAddresses', JSON.stringify(demoAddresses));
    }
  };

  const updateLocalStorage = (updatedAddresses: Address[]) => {
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
  };

  const handleSaveAddress = (address: Address) => {
    let updatedAddresses;
    
    // Set userId for new addresses
    const addressWithUserId = { ...address, userId: 'demo-user-1' };

    if (addresses.some(a => a.id === addressWithUserId.id)) {
      // Update existing address
      updatedAddresses = addresses.map(a => a.id === addressWithUserId.id ? addressWithUserId : a);
      toast({ 
        title: 'Address Updated', 
        description: 'Your address has been updated successfully.' 
      });
    } else {
      // Add new address
      updatedAddresses = [...addresses, addressWithUserId];
      toast({ 
        title: 'Address Added', 
        description: 'A new address has been added to your account.' 
      });
    }

    // Handle default address logic
    if (addressWithUserId.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({
        ...a, 
        isDefault: a.id === addressWithUserId.id
      }));
    }

    updateLocalStorage(updatedAddresses);
    setIsDialogOpen(false);
    setSelectedAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (address: Address) => {
    setDeleteConfirm({ isOpen: true, address });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm.address) return;

    const updatedAddresses = addresses.filter(address => address.id !== deleteConfirm.address!.id);
    
    // If we're deleting the default address and there are other addresses, make the first one default
    if (deleteConfirm.address.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    updateLocalStorage(updatedAddresses);
    setDeleteConfirm({ isOpen: false, address: null });
    
    toast({ 
      title: 'Address Removed', 
      description: 'The address has been removed from your account.',
      variant: 'destructive'
    });
  };

  const handleOpenDialog = (address: Address | null = null) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              My Addresses
            </CardTitle>
            <CardDescription>
              Manage your saved shipping and billing addresses for faster checkout.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New Address
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No addresses saved</p>
              <p>Add your first address to speed up checkout.</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <Card key={address.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{address.title}</h3>
                        {address.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit address</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(address)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete address</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{address.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {address.phone}
                        </div>
                      </div>

                      <div className="text-sm">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>

                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => {
                          const updatedAddress = { ...address, isDefault: true };
                          handleSaveAddress(updatedAddress);
                        }}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
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

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => 
        setDeleteConfirm({ isOpen: open, address: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the address "{deleteConfirm.address?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
