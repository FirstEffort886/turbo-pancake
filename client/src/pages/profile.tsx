import { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { User as UserIcon, Trophy, Wallet, History, LogOut, CreditCard } from 'lucide-react';
import WalletModal from '@/components/wallet/wallet-modal';

interface ProfileProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Profile({ user, setUser }: ProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Fetch user transactions
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/transactions'],
    staleTime: 30000
  });
  
  // Fetch user's game scores
  const { data: gameScores, isLoading: loadingScores } = useQuery({
    queryKey: ['/api/game-scores'],
    // If the API doesn't exist, this will fail silently
    staleTime: 30000,
    enabled: false // Disable since we don't have this API yet
  });

  // Profile form schema
  const profileFormSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional()
  });

  // Form setup with React Hook Form
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      city: user.city || '',
      phone: user.phone || ''
    }
  });

  // Update form values when user changes
  useEffect(() => {
    form.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      city: user.city || '',
      phone: user.phone || ''
    });
  }, [user, form]);

  // Handle profile update
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      // This endpoint would need to be implemented
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, values);
      const updatedUser = await response.json();
      
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and view your gaming history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-2">
                <UserIcon className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">Wallet Balance</span>
                    <p className="font-semibold">₹{user.walletBalance}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowWalletModal(true)}
                  >
                    Add Money
                  </Button>
                </div>
                <Separator />
                <div className="text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <p>{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                </div>
                <Separator />
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">
                <UserIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Wallet</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account settings and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet & Transactions</CardTitle>
                  <CardDescription>
                    Manage your wallet and view transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Available Balance</p>
                        <p className="text-3xl font-bold">₹{user.walletBalance}</p>
                      </div>
                      <div className="flex mt-4 md:mt-0 space-x-3">
                        <Button 
                          variant="default"
                          onClick={() => setShowWalletModal(true)}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Add Money
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowWalletModal(true)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  
                  {loadingTransactions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction: any) => (
                        <div key={transaction.id} className="flex justify-between items-center p-3 border-b border-gray-100">
                          <div>
                            <div className="font-medium">{transaction.description || transaction.type}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, yyyy - h:mm a') : 'N/A'}
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.type === 'deposit' || transaction.type === 'winning'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'winning' ? '+' : '-'}
                            ₹{Math.abs(transaction.amount)}
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center pt-2">
                        <Button variant="link" onClick={() => setShowWalletModal(true)}>
                          View All Transactions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gaming History</CardTitle>
                  <CardDescription>
                    View your recent games and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This would show game history if the API existed */}
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="mb-2">Game history coming soon!</p>
                    <p className="text-sm">We're working on tracking all your gaming achievements.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Badges and trophies you've earned while playing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="mb-2">Achievements coming soon!</p>
                    <p className="text-sm">Keep playing to unlock achievements and earn rewards.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <WalletModal 
        showModal={showWalletModal} 
        setShowModal={setShowWalletModal} 
        user={user}
      />
    </>
  );
}
