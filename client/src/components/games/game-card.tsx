import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronRight } from 'lucide-react';
import { Game } from '@shared/schema';
import { Link } from 'wouter';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={game.imageUrl} 
          alt={game.name} 
          className="w-full h-48 object-cover"
        />
        {game.rating >= 4.5 && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            POPULAR
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-poppins font-semibold text-lg">{game.name}</h3>
          <div className="flex items-center">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span className="text-sm font-medium ml-1">{game.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3">{game.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Prize: ₹{game.prizeAmount}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center p-0"
            onClick={() => onPlay(game)}
          >
            Play Now
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
