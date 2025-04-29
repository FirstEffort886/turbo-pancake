import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Game, TriviaQuestion } from '@shared/schema';

interface GameResults {
  score: number;
  timeSpent: number;
  completed: boolean;
  prize?: number;
}

interface UseGameReturn {
  loading: boolean;
  getGames: () => Promise<Game[]>;
  getGameById: (id: number) => Promise<Game | null>;
  getGamesByCategory: (category: string) => Promise<Game[]>;
  submitScore: (gameId: number, score: number, timeSpent: number) => Promise<GameResults | null>;
  getTriviaQuestions: (limit?: number) => Promise<TriviaQuestion[]>;
}

export const useGame = (): UseGameReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getGames = async (): Promise<Game[]> => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/games');
      return await response.json();
    } catch (error) {
      toast({
        title: 'Failed to Load Games',
        description: 'Could not retrieve game list',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGameById = async (id: number): Promise<Game | null> => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/games/${id}`);
      return await response.json();
    } catch (error) {
      toast({
        title: 'Failed to Load Game',
        description: 'Could not retrieve game details',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGamesByCategory = async (category: string): Promise<Game[]> => {
    setLoading(true);
    try {
      // This assumes the API supports filtering by category
      const response = await apiRequest('GET', `/api/games?category=${category}`);
      return await response.json();
    } catch (error) {
      toast({
        title: 'Failed to Load Games',
        description: `Could not retrieve games for category: ${category}`,
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async (
    gameId: number, 
    score: number, 
    timeSpent: number
  ): Promise<GameResults | null> => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/trivia/submit-score', {
        gameId,
        score,
        timeSpent,
        completed: true
      });
      
      const result = await response.json();
      
      // Invalidate relevant queries to reflect updated data
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      if (result.prize) {
        toast({
          title: 'Congratulations!',
          description: `You won ₹${result.prize}!`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Score Submitted',
          description: 'Your score has been recorded',
          variant: 'default'
        });
      }
      
      return {
        score,
        timeSpent,
        completed: true,
        prize: result.prize
      };
    } catch (error) {
      toast({
        title: 'Failed to Submit Score',
        description: 'An error occurred while saving your score',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTriviaQuestions = async (limit?: number): Promise<TriviaQuestion[]> => {
    setLoading(true);
    try {
      const url = limit ? `/api/trivia/questions?limit=${limit}` : '/api/trivia/questions';
      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error) {
      toast({
        title: 'Failed to Load Questions',
        description: 'Could not retrieve trivia questions',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getGames,
    getGameById,
    getGamesByCategory,
    submitScore,
    getTriviaQuestions
  };
};
