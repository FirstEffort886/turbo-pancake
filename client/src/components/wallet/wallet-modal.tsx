import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { User, Transaction } from '@shared/schema';
import { useState } from 'react';
import AddMoneyForm from './add-money-form';
import { Check, Wallet, Key, RefreshCw, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import AuthModal from '@/components/auth/auth-modal';

interface WalletModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  user: User | null;
}

export default function WalletModal({ showModal, setShowModal, user }: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<string>('balance');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(user?.walletBalance || 0);

  // Fetch transactions if user is logged in
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
    staleTime: 10000
  });

  // Show login modal if user is not logged in
  if (!user) {
    return (
      <>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Login Required</DialogTitle>
            </DialogHeader>
            <div className="text-center py-6">
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="mb-6">Please log in to access your wallet and manage your funds.</p>
              <Button 
                onClick={() => {
                  setShowModal(false);
                  setShowAuthModal(true);
                }}
              >
                Login Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <AuthModal 
          showModal={showAuthModal} 
          setShowModal={setShowAuthModal} 
          setUser={(newUser) => window.location.reload()} 
        />
      </>
    );
  }

  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <div className="bg-green-100 rounded-full p-2"><RefreshCw className="h-5 w-5 text-green-600" /></div>;
      case 'withdrawal':
        return <div className="bg-red-100 rounded-full p-2"><Key className="h-5 w-5 text-red-600" /></div>;
      case 'game_entry':
        return <div className="bg-blue-100 rounded-full p-2"><ShieldAlert className="h-5 w-5 text-blue-600" /></div>;
      case 'winning':
        return <div className="bg-green-100 rounded-full p-2"><Check className="h-5 w-5 text-green-600" /></div>;
      default:
        return <div className="bg-gray-100 rounded-full p-2"><Wallet className="h-5 w-5 text-gray-600" /></div>;
    }
  };

  const formatTransactionDate = (dateString: Date) => {
    return format(new Date(dateString), 'dd MMM, yyyy');
  };
  
  const getTransactionAmountColor = (type: string) => {
    return type === 'deposit' || type === 'winning' ? 'text-green-600' : 'text-red-600';
  };

  const formatTransactionAmount = (amount: number, type: string) => {
    const prefix = type === 'deposit' || type === 'winning' ? '+' : '-';
    return `${prefix}₹${Math.abs(amount)}`;
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-poppins text-primary text-center">
            Your Wallet
          </DialogTitle>
          <p className="text-center text-gray-600 mt-1">
            Manage your funds and transactions
          </p>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg my-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Available Balance</div>
            <div className="text-3xl font-bold text-gray-800 mt-1">₹{walletBalance}</div>
            <div className="flex justify-center space-x-3 mt-4">
              <Button 
                variant="default" 
                onClick={() => setActiveTab('add-money')}
              >
                Add Money
              </Button>
              <Button 
                variant="outline" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full border-b border-gray-200">
            <TabsTrigger className="flex-1" value="balance">Balance</TabsTrigger>
            <TabsTrigger className="flex-1" value="transactions">Transactions</TabsTrigger>
            <TabsTrigger className="flex-1" value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="space-y-4 pt-4">
            <div 
              className="bg-gray-50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => setActiveTab('add-money')}
            >
              <div>
                <div className="text-sm font-medium">Deposit Money</div>
                <div className="text-xs text-gray-500">Add funds to your wallet</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div 
              className="bg-gray-50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => setActiveTab('withdraw')}
            >
              <div>
                <div className="text-sm font-medium">Withdraw Funds</div>
                <div className="text-xs text-gray-500">Withdraw to your bank account</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100">
              <div>
                <div className="text-sm font-medium">Payment Methods</div>
                <div className="text-xs text-gray-500">Manage your payment options</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center">
                      {renderTransactionIcon(transaction.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium">{transaction.description || transaction.type}</div>
                        <div className="text-xs text-gray-500">{formatTransactionDate(transaction.createdAt)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${getTransactionAmountColor(transaction.type)}`}>
                      {formatTransactionAmount(transaction.amount, transaction.type)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions found.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-4 pt-4">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Welcome Bonus</div>
                  <div className="text-white/80 text-sm mt-1">50% match on first deposit</div>
                </div>
                <Button variant="secondary" size="sm" className="bg-white text-amber-500 hover:bg-white/90">
                  Claim
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Refer a Friend</div>
                  <div className="text-white/80 text-sm mt-1">Get ₹100 for each new user</div>
                </div>
                <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-white/90">
                  Share
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Daily Login Bonus</div>
                  <div className="text-white/80 text-sm mt-1">Log in daily for rewards</div>
                </div>
                <div className="bg-white text-gray-700 px-3 py-1 rounded text-xs font-medium">
                  Claimed
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="add-money" className="pt-4">
            <AddMoneyForm
              userId={user.id}
              currentBalance={walletBalance}
              onSuccess={(newBalance) => {
                setWalletBalance(newBalance);
                setActiveTab('balance');
              }}
            />
          </TabsContent>
          
          <TabsContent value="withdraw" className="pt-4">
            <AddMoneyForm
              userId={user.id}
              currentBalance={walletBalance}
              isWithdrawal={true}
              onSuccess={(newBalance) => {
                setWalletBalance(newBalance);
                setActiveTab('balance');
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
