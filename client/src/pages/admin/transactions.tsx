import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { User, Transaction } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Search,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AdminSidebar from '@/components/admin/sidebar';

interface AdminTransactionsProps {
  user: User;
}

export default function AdminTransactions({ user }: AdminTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    staleTime: 30000
  });

  // Filter transactions based on search term and type
  const filteredTransactions = transactions 
    ? transactions.filter((tx: Transaction) => {
        const matchesSearch = searchTerm === '' || 
          tx.id.toString().includes(searchTerm) ||
          tx.userId.toString().includes(searchTerm) ||
          (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = filterType === 'all' || tx.type === filterType;
        
        return matchesSearch && matchesType;
      })
    : [];

  // Define columns for the transactions table
  const columns: Column<Transaction>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'w-16'
    },
    {
      header: 'User ID',
      accessor: 'userId'
    },
    {
      header: 'Type',
      accessor: (row) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.type === 'deposit' ? 'bg-green-100 text-green-800' :
          row.type === 'withdrawal' ? 'bg-red-100 text-red-800' :
          row.type === 'game_entry' ? 'bg-blue-100 text-blue-800' :
          row.type === 'winning' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className={`font-medium ${
          row.type === 'deposit' || row.type === 'winning' ? 'text-green-600' : 'text-red-600'
        }`}>
          {row.type === 'deposit' || row.type === 'winning' ? '+' : '-'}
          ₹{Math.abs(row.amount)}
        </span>
      )
    },
    {
      header: 'Description',
      accessor: (row) => row.description || 'N/A'
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' : 
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (row) => format(new Date(row.createdAt), 'dd MMM yyyy, h:mm a')
    },
    {
      header: 'Actions',
      accessor: () => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-500">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24'
    }
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-3">
        <AdminSidebar activeItem="transactions" />
      </div>
      
      <div className="col-span-12 lg:col-span-9">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-poppins mb-2">Transaction History</h1>
          <p className="text-gray-600">View and manage all financial transactions on the platform</p>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="game_entry">Game Entry</SelectItem>
                    <SelectItem value="winning">Winning</SelectItem>
                  </SelectContent>
                </Select>
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
                data={filteredTransactions}
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
