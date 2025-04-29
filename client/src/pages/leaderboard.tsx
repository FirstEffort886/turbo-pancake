import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medal, Trophy, Award } from 'lucide-react';

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [limit, setLimit] = useState('10');

  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', { limit: parseInt(limit) }],
    staleTime: 30000
  });

  // Define columns for data table
  const columns: Column<any>[] = [
    {
      header: 'Rank',
      accessor: (row, index) => (
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
            index === 0 ? 'bg-primary text-white' :
            index === 1 ? 'bg-gray-300 text-gray-800' :
            index === 2 ? 'bg-yellow-300 text-yellow-800' :
            'bg-gray-200 text-gray-700'
          } font-bold text-sm`}>{index + 1}</div>
        </div>
      ),
      className: 'w-20'
    },
    {
      header: 'Player',
      accessor: (row) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
            {row.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{row.username}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Score',
      accessor: 'score'
    },
    {
      header: 'Time Spent',
      accessor: (row) => {
        const minutes = Math.floor(row.timeSpent / 60);
        const seconds = row.timeSpent % 60;
        return `${minutes}m ${seconds}s`;
      }
    },
    {
      header: 'Earnings',
      accessor: (row) => (
        <span className="font-medium text-green-600">
          ₹{(row.score / 100 * 50).toFixed(0)}
        </span>
      )
    }
  ];

  // Top 3 leaderboard cards
  const renderTopPlayers = () => {
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No leaderboard data available
        </div>
      );
    }

    const topThree = leaderboard.slice(0, 3);
    const positions = [
      { color: 'from-amber-500 to-yellow-600', icon: <Trophy className="h-10 w-10 text-yellow-200" />, title: '1st Place' },
      { color: 'from-gray-400 to-gray-600', icon: <Medal className="h-10 w-10 text-gray-200" />, title: '2nd Place' },
      { color: 'from-amber-700 to-amber-900', icon: <Award className="h-10 w-10 text-amber-200" />, title: '3rd Place' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topThree.map((player, index) => (
          <Card key={player.id} className={`overflow-hidden`}>
            <div className={`bg-gradient-to-r ${positions[index].color} text-white p-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl">{positions[index].title}</h3>
                  <p className="text-white/80">Score: {player.score}</p>
                </div>
                {positions[index].icon}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xl">
                  {player.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-lg">{player.username}</div>
                  <div className="text-green-600 font-medium">₹{(player.score / 100 * 50).toFixed(0)} earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins mb-2">Leaderboard</h1>
        <p className="text-gray-600">Check out the top performers and compete to get your name on the board!</p>
      </div>

      {/* Top Three Players */}
      {!isLoading && renderTopPlayers()}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Top Players</CardTitle>
            <div className="flex gap-4">
              <Tabs defaultValue="daily" value={timeFrame} onValueChange={setTimeFrame} className="w-[240px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Show 10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="25">Show 25</SelectItem>
                  <SelectItem value="50">Show 50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="daily" className="mt-0 pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={leaderboard || []}
                idAccessor="id"
                pageSize={parseInt(limit)}
              />
            )}
          </TabsContent>
          <TabsContent value="weekly" className="mt-0 pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={leaderboard || []}
                idAccessor="id"
                pageSize={parseInt(limit)}
              />
            )}
          </TabsContent>
          <TabsContent value="monthly" className="mt-0 pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={leaderboard || []}
                idAccessor="id"
                pageSize={parseInt(limit)}
              />
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </>
  );
}
