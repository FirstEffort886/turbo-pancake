import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { User, TriviaQuestion } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface TriviaGameProps {
  user: User | null;
  gameId: number;
  onExit: () => void;
}

export default function TriviaGame({ user, gameId, onExit }: TriviaGameProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch trivia questions
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['/api/trivia/questions'],
    staleTime: Infinity // Only fetch once per session
  });

  useEffect(() => {
    if (questions && questions.length > 0) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questions, currentQuestion]);

  const startTimer = () => {
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          checkAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      checkAnswer(answer);
    }
  };

  const checkAnswer = (answer: string | null) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsAnswered(true);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 100);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setIsGameOver(true);
      submitScore();
    }
  };

  const submitScore = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save your score",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/trivia/submit-score', {
        userId: user.id,
        gameId: gameId,
        score: score,
        timeSpent: (10 - timeLeft) * questions.length,
        completed: true
      });
      
      const data = await response.json();
      
      if (data.prize) {
        toast({
          title: "Congratulations!",
          description: `You won ₹${data.prize}!`,
          variant: "default"
        });
        
        // Invalidate wallet balance cache to show updated balance
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      toast({
        title: "Error",
        description: "Failed to submit your score",
        variant: "destructive"
      });
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setIsGameOver(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-4">Failed to load questions</h3>
        <p className="text-gray-600 mb-6">We couldn't load the trivia questions. Please try again later.</p>
        <Button onClick={onExit}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!isGameOver ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold font-poppins text-primary">Trivia Master</h3>
            <p className="text-gray-600 mt-1">
              Question <span>{currentQuestion + 1}</span> of <span>{questions.length}</span>
            </p>
          </div>
          
          <div className="mb-4">
            <Progress value={timeLeft * 10} className="h-2.5 mb-1" />
            <div className="flex justify-between text-sm text-gray-600">
              <div>Time Left: <span>{timeLeft}</span>s</div>
              <div>Score: <span>{score}</span></div>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-medium text-center">{questions[currentQuestion].question}</h4>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => selectAnswer(option)}
                variant="outline"
                className={`w-full text-left justify-start p-4 h-auto ${
                  isAnswered && option === questions[currentQuestion].correctAnswer 
                    ? 'bg-green-100 border-green-500 text-green-900'
                    : isAnswered && option === selectedAnswer 
                    ? 'bg-red-100 border-red-500 text-red-900'
                    : ''
                }`}
                disabled={isAnswered}
              >
                <div className="flex items-center w-full">
                  <span className="flex-grow">{option}</span>
                  {isAnswered && option === questions[currentQuestion].correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {isAnswered && option === selectedAnswer && option !== questions[currentQuestion].correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold font-poppins text-primary mt-4">Game Over!</h3>
            <p className="text-gray-600 mt-1">
              Your score: <span className="font-bold text-primary">{score}</span> points
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg inline-block">
              <div className="text-sm">
                You've answered <span className="font-semibold">{score/100}</span> out of <span>{questions.length}</span> correctly!
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <Button onClick={restartGame}>
              Play Again
            </Button>
            <Button variant="outline" onClick={onExit}>
              Exit Game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
