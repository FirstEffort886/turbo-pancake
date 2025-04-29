import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface UseWalletReturn {
  balance: number | null;
  loading: boolean;
  addMoney: (amount: number) => Promise<boolean>;
  withdrawMoney: (amount: number) => Promise<boolean>;
  getTransactions: () => Promise<any[]>;
}

export const useWallet = (initialBalance: number | null = null): UseWalletReturn => {
  const [balance, setBalance] = useState<number | null>(initialBalance);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMoney = async (amount: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/wallet/add', { amount });
      const data = await response.json();
      setBalance(data.balance);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      toast({
        title: 'Money Added',
        description: `₹${amount} has been added to your wallet`,
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Failed to Add Money',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const withdrawMoney = async (amount: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/wallet/withdraw', { amount });
      const data = await response.json();
      setBalance(data.balance);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      toast({
        title: 'Withdrawal Successful',
        description: `₹${amount} has been withdrawn from your wallet`,
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/transactions');
      const transactions = await response.json();
      return transactions;
    } catch (error) {
      toast({
        title: 'Failed to Load Transactions',
        description: 'Could not retrieve transaction history',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    loading,
    addMoney,
    withdrawMoney,
    getTransactions
  };
};
