import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@shared/schema';
import { Link } from 'wouter';
import { 
  Users, 
  LineChart, 
  DollarSign,
  Activity,
  Gamepad2
} from 'lucide-react';
import AdminSidebar from '@/components/admin/sidebar';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch users
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    staleTime: 30000
  });

  // Fetch transactions
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/admin/transactions'],
    staleTime: 30000
  });

  // Get summary stats for dashboard
  const getStats = () => {
    if (!users || !transactions) {
      return {
        totalUsers: 0,
        totalRevenue: 0,
        totalGames: 0,
        totalTransactions: 0
      };
    }

    const totalUsers = users.length;
    const totalTransactions = transactions.length;
    
    // Calculate revenue (only count deposits and game entries)
    const totalRevenue = transactions
      .filter((t: any) => t.type === 'deposit' || t.type === 'game_entry')
      .reduce((sum: number, t: any) => sum + (t.type === 'deposit' ? t.amount : Math.abs(t.amount)), 0);
    
    // Since we don't have a games API endpoint, hardcode this for demo
    const totalGames = 4;

    return {
      totalUsers,
      totalRevenue,
      totalGames,
      totalTransactions
    };
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-3">
        <AdminSidebar activeItem="dashboard" />
      </div>
      
      <div className="col-span-12 lg:col-span-9">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-poppins mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.username}. Here's an overview of your platform.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold">
                    {loadingUsers ? 
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                      stats.totalUsers
                    }
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">
                    {loadingTransactions ? 
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                      `₹${stats.totalRevenue}`
                    }
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Gamepad2 className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Games</p>
                  <h3 className="text-2xl font-bold">
                    {loadingUsers ? 
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                      stats.totalGames
                    }
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions</p>
                  <h3 className="text-2xl font-bold">
                    {loadingTransactions ? 
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                      stats.totalTransactions
                    }
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Recent Users */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recent Users</CardTitle>
                  <Link href="/admin/users">
                    <div className="text-sm text-primary hover:underline cursor-pointer">View All</div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                          <div className="ml-3 h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <div>
                    {users.slice(0, 5).map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No users found</div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <Link href="/admin/transactions">
                    <div className="text-sm text-primary hover:underline cursor-pointer">View All</div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between py-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div>
                    {transactions.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="text-sm">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          User ID: {transaction.userId}
                        </div>
                        <div className={`text-sm font-medium ${
                          transaction.type === 'deposit' || transaction.type === 'winning' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'winning' ? '+' : '-'}
                          ₹{Math.abs(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No transactions found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <LineChart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p>Analytics dashboard coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
