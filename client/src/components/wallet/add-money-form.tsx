import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AddMoneyFormProps {
  userId: number;
  currentBalance: number;
  isWithdrawal?: boolean;
  onSuccess: (newBalance: number) => void;
}

export default function AddMoneyForm({ userId, currentBalance, isWithdrawal = false, onSuccess }: AddMoneyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Define preset amounts
  const presetAmounts = isWithdrawal ? [100, 200, 500, 1000] : [100, 500, 1000, 2000];
  
  // Form schema
  const formSchema = z.object({
    amount: z.string().refine(val => {
      const amount = Number(val);
      return !isNaN(amount) && amount > 0;
    }, { message: "Please enter a valid amount" }),
    paymentMethod: isWithdrawal ? z.enum(["bank", "upi"]) : z.enum(["card", "upi", "netbanking"])
  });
  
  // Setup form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '100',
      paymentMethod: isWithdrawal ? 'bank' : 'upi'
    }
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const numAmount = parseFloat(values.amount);
      
      // Validate withdrawal amount against balance
      if (isWithdrawal && numAmount > currentBalance) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough funds to withdraw this amount",
          variant: "destructive"
        });
        return;
      }
      
      const endpoint = isWithdrawal ? '/api/wallet/withdraw' : '/api/wallet/add';
      
      const response = await apiRequest('POST', endpoint, { amount: numAmount });
      const data = await response.json();
      
      toast({
        title: isWithdrawal ? "Withdrawal Successful" : "Money Added Successfully",
        description: isWithdrawal 
          ? `₹${numAmount} has been sent to your account` 
          : `₹${numAmount} has been added to your wallet`,
        variant: "default"
      });
      
      onSuccess(data.balance);
    } catch (error) {
      console.error(isWithdrawal ? 'Withdrawal error:' : 'Add money error:', error);
      toast({
        title: isWithdrawal ? "Withdrawal Failed" : "Failed to Add Money",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {isWithdrawal ? 'Withdraw Money' : 'Add Money to Wallet'}
      </h3>
      
      {isWithdrawal && (
        <div className="bg-amber-50 p-3 rounded-lg mb-4 text-sm text-amber-800">
          <p>Withdrawals are processed within 24 hours. Minimum withdrawal amount is ₹100.</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    {...field}
                    min={isWithdrawal ? 100 : 1} 
                    max={isWithdrawal ? currentBalance : 50000}
                  />
                </FormControl>
                <div className="flex flex-wrap gap-2 mt-2">
                  {presetAmounts.map((amount) => (
                    <Button 
                      key={amount} 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className={field.value === amount.toString() ? 'bg-primary text-white' : ''}
                      onClick={() => form.setValue('amount', amount.toString())}
                      disabled={isWithdrawal && amount > currentBalance}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    {isWithdrawal ? (
                      <>
                        <Card className={field.value === 'bank' ? 'border-primary' : ''}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="bank" id="bank" className="sr-only" />
                            <label htmlFor="bank" className="flex flex-col items-center cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span>Bank Account</span>
                            </label>
                          </CardContent>
                        </Card>
                        
                        <Card className={field.value === 'upi' ? 'border-primary' : ''}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="upi" id="upi" className="sr-only" />
                            <label htmlFor="upi" className="flex flex-col items-center cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                              </svg>
                              <span>UPI</span>
                            </label>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <>
                        <Card className={field.value === 'card' ? 'border-primary' : ''}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="card" id="card" className="sr-only" />
                            <label htmlFor="card" className="flex flex-col items-center cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                              <span>Card</span>
                            </label>
                          </CardContent>
                        </Card>
                        
                        <Card className={field.value === 'upi' ? 'border-primary' : ''}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="upi" id="upi" className="sr-only" />
                            <label htmlFor="upi" className="flex flex-col items-center cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                              </svg>
                              <span>UPI</span>
                            </label>
                          </CardContent>
                        </Card>
                        
                        <Card className={field.value === 'netbanking' ? 'border-primary' : ''}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="netbanking" id="netbanking" className="sr-only" />
                            <label htmlFor="netbanking" className="flex flex-col items-center cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>Net Banking</span>
                            </label>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              isWithdrawal ? 'Withdraw Money' : 'Add Money'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
