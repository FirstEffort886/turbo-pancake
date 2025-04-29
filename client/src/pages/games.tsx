import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Game, GameCategory } from '@shared/schema';
import GameCard from '@/components/games/game-card';
import CategoryCard from '@/components/games/category-card';
import TriviaGame from '@/components/games/trivia/trivia-game';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Tag } from 'lucide-react';

interface GamesProps {
  user: User | null;
}

export default function Games({ user }: GamesProps) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const handlePlayGame = (game: Game) => {
    setCurrentGame(game);
    setShowGameModal(true);
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setCurrentGame(null);
  };

  const handleCategorySelect = (category: GameCategory) => {
    setSelectedCategory(selectedCategory === category.name ? null : category.name);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  // Filter games based on search term and selected category
  const filteredGames = games ? games.filter((game: Game) => {
    const matchesSearch = searchTerm === '' || 
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || game.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins mb-2">Games</h1>
        <p className="text-gray-600">Explore our collection of exciting games and start playing right now!</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search games..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedCategory && (
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5"
              onClick={handleResetFilters}
            >
              <Tag className="h-4 w-4" />
              {selectedCategory}
              <span className="ml-1 text-gray-500">✕</span>
            </Button>
          )}
        </div>

        {/* Categories Filter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {loadingCategories ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse"></div>
            ))
          ) : categories && categories.length > 0 ? (
            categories.map((category: GameCategory) => (
              <div 
                key={category.id}
                className={`cursor-pointer ${selectedCategory === category.name ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                <CategoryCard category={category} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4">
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>
      </div>

      {/* Games Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-poppins mb-6">
          {selectedCategory ? `${selectedCategory} Games` : 'All Games'}
          {searchTerm && ` matching "${searchTerm}"`}
        </h2>

        {loadingGames ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game: Game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onPlay={handlePlayGame} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <Search className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">No games found</h3>
            <p className="text-gray-500 mb-4">We couldn't find any games matching your criteria.</p>
            <Button onClick={handleResetFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

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
