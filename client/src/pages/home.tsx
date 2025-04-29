import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { User, Game, GameCategory } from '@shared/schema';
import GameCard from '@/components/games/game-card';
import CategoryCard from '@/components/games/category-card';
import TriviaGame from '@/components/games/trivia/trivia-game';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ChevronRight, 
  Calendar, 
  Users
} from 'lucide-react';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);

  // Fetch game categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['/api/game-categories'],
    staleTime: 30000
  });

  // Fetch games
  const { data: games, isLoading: loadingGames } = useQuery({
    queryKey: ['/api/games'],
    staleTime: 30000
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
    staleTime: 30000
  });

  const handlePlayGame = (game: Game) => {
    setCurrentGame(game);
    setShowGameModal(true);
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setCurrentGame(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-8 md:py-12 mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-6 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-3">Play, Compete & Win Real Rewards!</h2>
            <p className="text-lg opacity-90 mb-6">Join thousands of players competing in fun casual games and win exciting prizes.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/games">
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 md:opacity-40">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 4V2M17 4V6M17 4H13.5M7 20V22M7 20V18M7 20H10.5M3 18V20M21 18V20M16.5 20C16.5 21.1046 15.6046 22 14.5 22H9.5C8.39543 22 7.5 21.1046 7.5 20M16.5 20C16.5 18.8954 15.6046 18 14.5 18H9.5C8.39543 18 7.5 18.8954 7.5 20M16.5 16V4.5C16.5 3.67157 17.1716 3 18 3C18.8284 3 19.5 3.67157 19.5 4.5V16C19.5 16.8284 18.8284 17.5 18 17.5C17.1716 17.5 16.5 16.8284 16.5 16ZM4.5 16V4.5C4.5 3.67157 5.17157 3 6 3C6.82843 3 7.5 3.67157 7.5 4.5V16C7.5 16.8284 6.82843 17.5 6 17.5C5.17157 17.5 4.5 16.8284 4.5 16ZM4.5 4.5H7.5M19.5 4.5H16.5M4.5 16H7.5M19.5 16H16.5M10.5 5V15C10.5 15 11.5 16 13.5 16C15.5 16 16.5 15 16.5 15V5C16.5 5 15.5 4 13.5 4C11.5 4 10.5 5 10.5 5ZM10.5 8H16.5M10.5 12H16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-poppins">Game Categories</h2>
          <Link href="/games">
            <div className="text-primary font-medium hover:text-primary-600 flex items-center cursor-pointer">
              View All 
              <ChevronRight className="h-5 w-5 ml-1" />
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loadingCategories ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse"></div>
            ))
          ) : categories && categories.length > 0 ? (
            categories.map((category: GameCategory) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No game categories available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Games */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-poppins">Featured Games</h2>
          <Link href="/games">
            <div className="text-primary font-medium hover:text-primary-600 flex items-center cursor-pointer">
              View All 
              <ChevronRight className="h-5 w-5 ml-1" />
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingGames ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
            ))
          ) : games && games.length > 0 ? (
            games.map((game: Game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onPlay={handlePlayGame} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No games available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mb-10">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-poppins">Top Players</h2>
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                View Full Leaderboard
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingLeaderboard ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-6"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((score: any, index: number) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
                            index === 0 ? 'bg-primary text-white' :
                            index === 1 ? 'bg-gray-300 text-gray-800' :
                            index === 2 ? 'bg-yellow-300 text-yellow-800' :
                            'bg-gray-200 text-gray-700'
                          } font-bold text-sm`}>{index + 1}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
                            {score.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{score.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{score.score}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">₹{(score.score / 100 * 50).toFixed(0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No leaderboard data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-secondary to-secondary-600 rounded-xl p-6 md:p-8 text-white">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-3">Download Our App</h2>
              <p className="text-white/90 mb-6">Get the full experience on your mobile device. Play games anytime, anywhere and never miss a tournament!</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" className="bg-white text-gray-800 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Get on Google Play
                </Button>
                <Button variant="secondary" className="bg-white text-gray-800 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1.2A8.8 8.8 0 1018.8 10 8.81 8.81 0 0010 1.2zm0 16.6a7.8 7.8 0 117.8-7.8 7.81 7.81 0 01-7.8 7.8z" />
                    <path d="M8.5 6.5a1 1 0 012 0v3.5H14a1 1 0 110 2h-4.5a1 1 0 01-1-1V6.5z" />
                  </svg>
                  Coming soon on App Store
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <img 
                src="https://images.unsplash.com/photo-1533228876829-65c94e7b5025?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                alt="Mobile App" 
                className="rounded-lg shadow-lg h-64 object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Game Modal */}
      <Dialog open={showGameModal} onOpenChange={setShowGameModal}>
        <DialogContent className="sm:max-w-[700px] p-0">
          <div className="p-6">
            {currentGame && currentGame.category === 'Trivia' && (
              <TriviaGame 
                user={user} 
                gameId={currentGame.id} 
                onExit={closeGameModal} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
