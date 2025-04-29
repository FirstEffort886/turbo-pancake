import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { User } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Users, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';
import AdminSidebar from '@/components/admin/sidebar';

interface AdminUsersProps {
  user: User;
}

export default function AdminUsers({ user }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    staleTime: 30000
  });

  // Filter users based on search term
  const filteredUsers = users ? users.filter((user: User) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Define columns for the users table
  const columns: Column<User>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'w-16'
    },
    {
      header: 'User',
      accessor: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {row.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">{row.username}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Name',
      accessor: (row) => row.fullName || 'N/A'
    },
    {
      header: 'City',
      accessor: (row) => row.city || 'N/A'
    },
    {
      header: 'Role',
      accessor: (row) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.isAdmin ? 'Admin' : 'User'}
        </div>
      )
    },
    {
      header: 'Wallet',
      accessor: (row) => (
        <span className="font-medium text-green-600">₹{row.walletBalance}</span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
          <span>Active</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: () => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24'
    }
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-3">
        <AdminSidebar activeItem="users" />
      </div>
      
      <div className="col-span-12 lg:col-span-9">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-poppins mb-2">User Management</h1>
          <p className="text-gray-600">View and manage all users on the platform</p>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredUsers}
                idAccessor="id"
                pageSize={10}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
