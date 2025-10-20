
'use client';

import * as React from 'react';
import { MoreHorizontal, Search, Star } from 'lucide-react';
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
// User data will be fetched via API
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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


// Local UI user type (different from backend schema; we map on fetch)
type AdminUIUser = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Buyer' | 'Seller';
  status: 'Active' | 'Blocked' | 'Pending';
  rating: number;
  registrationDate: string;
  avatar?: string;
};

const statusConfig: Record<AdminUIUser['status'], string> = {
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Blocked': 'bg-red-100 text-red-800 border-red-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const roleConfig: Record<AdminUIUser['role'], string> = {
    'Admin': 'bg-primary/10 text-primary border-primary/20',
    'Buyer': 'bg-blue-100 text-blue-800 border-blue-200',
    'Seller': 'bg-purple-100 text-purple-800 border-purple-200',
    'User': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState<AdminUIUser[]>([]);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = React.useState(false);
  const [userToAction, setUserToAction] = React.useState<AdminUIUser | null>(null);
    const [actionType, setActionType] = React.useState<'Block' | 'Unblock' | null>(null);

    const { toast } = useToast();

  // Initial fetch of users (was missing) and whenever we need a refresh
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) {
          console.warn('Failed to load users, status:', res.status);
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          // Map backend shape to UI expected shape.
          const mapped: AdminUIUser[] = data.users.map((u: any) => ({
            id: u.id,
            name: u.fullName || u.name || 'Unnamed',
            email: u.email,
            role: (u.role === 'admin' ? 'Admin' : 'User'),
            status: 'Active', // default until status field exists
            rating: 5, // static placeholder; could be average of reviews
            registrationDate: u.createdAt || new Date().toISOString(),
            avatar: u.profilePicture || '/images/products/background.jpg'
          }));
          setUsers(mapped);
        }
      } catch (e) {
        console.error('Fetch users error:', e);
      }
    };
    fetchUsers();
  }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        if (term) {
            setUsers(users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)));
        } else {
            // Reset to all users from the fetched data
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/admin/users');
                    const data = await response.json();
                    if (data.success) {
                        setUsers(data.users);
                    }
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                }
            };
            fetchUsers();
        }
    };
    
  const handleOpenAlert = (user: AdminUIUser, type: 'Block' | 'Unblock') => {
        setUserToAction(user);
        setActionType(type);
        setIsAlertDialogOpen(true);
    };

    const confirmAction = () => {
        if (userToAction && actionType) {
            const newStatus = actionType === 'Block' ? 'Blocked' : 'Active';
            // Placeholder: would call an API to change status when implemented
            // Refresh the user list from API
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/admin/users');
                    const data = await response.json();
                    if (data.success) {
                        setUsers(data.users);
                    }
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                }
            };
            fetchUsers();
            toast({
                title: `User ${actionType}ed`,
                description: `${userToAction.name} has been ${actionType.toLowerCase()}ed.`,
            });
        }
        setIsAlertDialogOpen(false);
        setUserToAction(null);
        setActionType(null);
    };

    const getUsersForTab = (tab: string) => {
        if (tab === 'all') return users;
        return users.filter(u => u.role.toLowerCase() === tab);
    };

  return (
    <>
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Buyer">Buyers</TabsTrigger>
            <TabsTrigger value="Seller">Sellers</TabsTrigger>
            <TabsTrigger value="Admin">Admins</TabsTrigger>
          </TabsList>
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <TabsContent value="all">
          <UserTable users={getUsersForTab('all')} onAction={handleOpenAlert} />
        </TabsContent>
         <TabsContent value="Buyer">
          <UserTable users={getUsersForTab('buyer')} onAction={handleOpenAlert} />
        </TabsContent>
         <TabsContent value="Seller">
          <UserTable users={getUsersForTab('seller')} onAction={handleOpenAlert} />
        </TabsContent>
         <TabsContent value="Admin">
          <UserTable users={getUsersForTab('admin')} onAction={handleOpenAlert} />
        </TabsContent>
      </Tabs>
    </main>
     <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will {actionType?.toLowerCase()} the user "{userToAction?.name}".
                    {actionType === 'Block' ? ' They will not be able to log in.' : ' They will regain access to their account.'}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToAction(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmAction}>
                    {actionType}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


function UserTable({ users, onAction }: { users: AdminUIUser[], onAction: (user: AdminUIUser, action: 'Block' | 'Unblock') => void }) {
    
    const renderRating = (rating: number) => {
        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        )
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Manage all user accounts and their roles on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registered
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                   <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleConfig[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={statusConfig[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {renderRating(user.rating)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(user.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>Edit User</Link>
                          </DropdownMenuItem>
                          {user.status === 'Active' ? (
                            <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => onAction(user, 'Block')}
                            >
                                Block User
                            </DropdownMenuItem>
                          ) : (
                             <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => onAction(user, 'Unblock')}
                            >
                                Unblock User
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
              Showing <strong>1-{users.length}</strong> of <strong>{users.length}</strong> users
            </div>
          </CardFooter>
        </Card>
    )
}
