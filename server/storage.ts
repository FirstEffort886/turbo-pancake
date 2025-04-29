import {
  users, User, InsertUser,
  games, Game, InsertGame,
  gameCategories, GameCategory, InsertGameCategory,
  transactions, Transaction, InsertTransaction,
  gameScores, GameScore, InsertGameScore,
  triviaQuestions, TriviaQuestion, InsertTriviaQuestion
} from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(id: number, amount: number): Promise<User | undefined>;
  updateUser(id: number, user: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
  
  // Game operations
  getGame(id: number): Promise<Game | undefined>;
  getGames(): Promise<Game[]>;
  getGamesByCategory(category: string): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Game category operations
  getGameCategory(id: number): Promise<GameCategory | undefined>;
  getGameCategories(): Promise<GameCategory[]>;
  createGameCategory(category: InsertGameCategory): Promise<GameCategory>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Game score operations
  getGameScore(id: number): Promise<GameScore | undefined>;
  getGameScoresByUserId(userId: number): Promise<GameScore[]>;
  getGameScoresByGameId(gameId: number): Promise<GameScore[]>;
  getTopScores(limit: number): Promise<(GameScore & { username: string })[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  
  // Trivia question operations
  getTriviaQuestion(id: number): Promise<TriviaQuestion | undefined>;
  getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]>;
  getTriviaQuestionsByCategory(category: string): Promise<TriviaQuestion[]>;
  createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private gameCategories: Map<number, GameCategory>;
  private transactions: Map<number, Transaction>;
  private gameScores: Map<number, GameScore>;
  private triviaQuestions: Map<number, TriviaQuestion>;
  
  private nextUserId: number;
  private nextGameId: number;
  private nextCategoryId: number;
  private nextTransactionId: number;
  private nextScoreId: number;
  private nextQuestionId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.gameCategories = new Map();
    this.transactions = new Map();
    this.gameScores = new Map();
    this.triviaQuestions = new Map();
    
    this.nextUserId = 1;
    this.nextGameId = 1;
    this.nextCategoryId = 1;
    this.nextTransactionId = 1;
    this.nextScoreId = 1;
    this.nextQuestionId = 1;
    
    // Seed some initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, walletBalance: 0, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  async updateUserWalletBalance(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      walletBalance: user.walletBalance + amount 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Game operations
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGamesByCategory(category: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.category === category);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.nextGameId++;
    const game: Game = { ...insertGame, id };
    this.games.set(id, game);
    return game;
  }

  // Game category operations
  async getGameCategory(id: number): Promise<GameCategory | undefined> {
    return this.gameCategories.get(id);
  }

  async getGameCategories(): Promise<GameCategory[]> {
    return Array.from(this.gameCategories.values());
  }

  async createGameCategory(insertCategory: InsertGameCategory): Promise<GameCategory> {
    const id = this.nextCategoryId++;
    const category: GameCategory = { ...insertCategory, id };
    this.gameCategories.set(id, category);
    return category;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId);
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const timestamp = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: timestamp 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Game score operations
  async getGameScore(id: number): Promise<GameScore | undefined> {
    return this.gameScores.get(id);
  }

  async getGameScoresByUserId(userId: number): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .filter(score => score.userId === userId);
  }

  async getGameScoresByGameId(gameId: number): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .filter(score => score.gameId === gameId);
  }

  async getTopScores(limit: number = 10): Promise<(GameScore & { username: string })[]> {
    const scores = Array.from(this.gameScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return scores.map(score => {
      const user = this.users.get(score.userId);
      return {
        ...score,
        username: user ? user.username : 'Unknown'
      };
    });
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = this.nextScoreId++;
    const timestamp = new Date();
    const score: GameScore = { 
      ...insertScore, 
      id, 
      createdAt: timestamp 
    };
    this.gameScores.set(id, score);
    return score;
  }

  // Trivia question operations
  async getTriviaQuestion(id: number): Promise<TriviaQuestion | undefined> {
    return this.triviaQuestions.get(id);
  }

  async getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]> {
    const questions = Array.from(this.triviaQuestions.values());
    if (limit) {
      return questions.slice(0, limit);
    }
    return questions;
  }

  async getTriviaQuestionsByCategory(category: string): Promise<TriviaQuestion[]> {
    return Array.from(this.triviaQuestions.values())
      .filter(question => question.category === category);
  }

  async createTriviaQuestion(insertQuestion: InsertTriviaQuestion): Promise<TriviaQuestion> {
    const id = this.nextQuestionId++;
    const question: TriviaQuestion = { ...insertQuestion, id };
    this.triviaQuestions.set(id, question);
    return question;
  }

  // Seed initial data
  private seedData() {
    // Seed admin user
    this.createUser({
      username: 'admin',
      email: 'admin@galaxygames.com',
      password: 'admin123',
      fullName: 'Admin User',
      city: 'Admin City',
      isAdmin: true,
      phone: null
    });

    // Seed test user
    this.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      city: 'Test City',
      isAdmin: false,
      phone: null
    }).then(user => {
      // Give test user some wallet balance
      this.updateUserWalletBalance(user.id, 1000);
    });

    // Seed game categories
    const categorySeed = [
      { name: 'Puzzle', icon: 'puzzle', colorClass: 'primary' },
      { name: 'Trivia', icon: 'book-open', colorClass: 'secondary' },
      { name: 'Board', icon: 'layout-grid', colorClass: 'amber' },
      { name: 'Action', icon: 'gamepad-2', colorClass: 'red' },
      { name: 'Multiplayer', icon: 'users', colorClass: 'indigo' }
    ];

    for (const category of categorySeed) {
      this.createGameCategory({
        name: category.name,
        icon: category.icon,
        colorClass: category.colorClass
      });
    }

    // Seed games
    const gamesSeed = [
      {
        name: 'Trivia Master',
        description: 'Test your knowledge across various categories and win big prizes!',
        category: 'Trivia',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b',
        rating: 4.8,
        prizeAmount: 500,
        isActive: true
      },
      {
        name: 'Ludo King',
        description: 'The classic board game reimagined. Challenge friends and win rewards!',
        category: 'Board',
        imageUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948',
        rating: 4.7,
        prizeAmount: 1000,
        isActive: true
      },
      {
        name: 'Carrom Clash',
        description: 'Show your skills in this digital version of the popular Carrom board game.',
        category: 'Board',
        imageUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948',
        rating: 4.6,
        prizeAmount: 750,
        isActive: true
      },
      {
        name: 'Rummy Pro',
        description: 'Play the strategic card game and compete with players across the country.',
        category: 'Multiplayer',
        imageUrl: 'https://images.unsplash.com/photo-1529480807634-183694b1a0b7',
        rating: 4.9,
        prizeAmount: 2000,
        isActive: true
      }
    ];

    for (const game of gamesSeed) {
      this.createGame(game);
    }

    // Seed trivia questions
    const triviaQuestionsSeed = [
      {
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris',
        category: 'Geography',
        difficulty: 'Easy'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        category: 'Science',
        difficulty: 'Easy'
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'],
        correctAnswer: 'Leonardo da Vinci',
        category: 'Art',
        difficulty: 'Medium'
      },
      {
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 'Pacific Ocean',
        category: 'Geography',
        difficulty: 'Easy'
      },
      {
        question: 'Which country is known as the Land of the Rising Sun?',
        options: ['China', 'Thailand', 'Japan', 'South Korea'],
        correctAnswer: 'Japan',
        category: 'Geography',
        difficulty: 'Medium'
      },
      {
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gl', 'Au', 'Ag'],
        correctAnswer: 'Au',
        category: 'Science',
        difficulty: 'Medium'
      },
      {
        question: 'Which famous scientist developed the theory of relativity?',
        options: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein', 'Stephen Hawking'],
        correctAnswer: 'Albert Einstein',
        category: 'Science',
        difficulty: 'Medium'
      },
      {
        question: 'What is the largest mammal in the world?',
        options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 'Blue Whale',
        category: 'Animals',
        difficulty: 'Easy'
      },
      {
        question: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correctAnswer: 'William Shakespeare',
        category: 'Literature',
        difficulty: 'Easy'
      },
      {
        question: 'What is the currency of Japan?',
        options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
        correctAnswer: 'Yen',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ];

    for (const question of triviaQuestionsSeed) {
      this.createTriviaQuestion(question);
    }

    // Seed game scores for leaderboard
    const gameId = 1; // Trivia Master
    const scoreData = [
      { userId: 1, score: 400, timeSpent: 120 },
      { userId: 2, score: 350, timeSpent: 150 }
    ];

    for (const score of scoreData) {
      this.createGameScore({
        userId: score.userId,
        gameId,
        score: score.score,
        timeSpent: score.timeSpent,
        completed: true
      });
    }
  }
}

export const storage = new MemStorage();
