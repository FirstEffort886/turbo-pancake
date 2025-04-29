import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginUserSchema, insertUserSchema, insertGameScoreSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Helper for validating request body against a schema
const validateBody = <T extends z.ZodTypeAny>(
  schema: T,
  req: Request
): z.infer<T> | null => {
  try {
    return schema.parse(req.body);
  } catch (error) {
    return null;
  }
};

// Setup session middleware
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup sessions
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "galaxygames-secret"
  }));

  // Auth middleware for protected routes
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Admin middleware for admin-only routes
  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    const userData = validateBody(insertUserSchema, req);
    if (!userData) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    try {
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }

      // Create the user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const loginData = validateBody(loginUserSchema, req);
    if (!loginData) {
      return res.status(400).json({ message: "Invalid login data" });
    }

    try {
      const user = await storage.getUserByEmail(loginData.email);
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // WALLET ROUTES
  app.get("/api/wallet", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ balance: user.walletBalance });
    } catch (error) {
      console.error("Get wallet error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/wallet/add", requireAuth, async (req, res) => {
    const { amount } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    try {
      const numAmount = Number(amount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId!,
        amount: numAmount,
        type: "deposit",
        description: "Added money to wallet",
        status: "completed"
      });
      
      // Update user wallet balance
      const user = await storage.updateUserWalletBalance(req.session.userId!, numAmount);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ 
        balance: user.walletBalance,
        transaction
      });
    } catch (error) {
      console.error("Add money error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/wallet/withdraw", requireAuth, async (req, res) => {
    const { amount } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    try {
      const numAmount = Number(amount);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.walletBalance < numAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId!,
        amount: -numAmount,
        type: "withdrawal",
        description: "Withdrew money from wallet",
        status: "completed"
      });
      
      // Update user wallet balance
      const updatedUser = await storage.updateUserWalletBalance(req.session.userId!, -numAmount);

      res.status(200).json({ 
        balance: updatedUser!.walletBalance,
        transaction
      });
    } catch (error) {
      console.error("Withdraw money error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.session.userId!);
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // GAME ROUTES
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.status(200).json(games);
    } catch (error) {
      console.error("Get games error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid game ID" });
    }
    
    try {
      const game = await storage.getGame(Number(id));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.status(200).json(game);
    } catch (error) {
      console.error("Get game error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/game-categories", async (req, res) => {
    try {
      const categories = await storage.getGameCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Get game categories error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // TRIVIA GAME ROUTES
  app.get("/api/trivia/questions", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const questions = await storage.getTriviaQuestions(limit);
      res.status(200).json(questions);
    } catch (error) {
      console.error("Get trivia questions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/trivia/submit-score", requireAuth, async (req, res) => {
    const scoreData = validateBody(insertGameScoreSchema, req);
    if (!scoreData) {
      return res.status(400).json({ message: "Invalid score data" });
    }

    try {
      // Override the userId with the authenticated user's ID
      scoreData.userId = req.session.userId!;
      
      // Create score record
      const score = await storage.createGameScore(scoreData);
      
      // Get the game to check prize amount
      const game = await storage.getGame(scoreData.gameId);
      
      // Award money if the score is good enough (for simplicity, award the prize if score > 300)
      if (game && scoreData.score >= 300) {
        const prizeAmount = game.prizeAmount;
        
        // Create transaction for the prize
        await storage.createTransaction({
          userId: req.session.userId!,
          amount: prizeAmount,
          type: "winning",
          description: `Prize for high score in ${game.name}`,
          status: "completed"
        });
        
        // Update user wallet balance
        await storage.updateUserWalletBalance(req.session.userId!, prizeAmount);
        
        res.status(200).json({ 
          score,
          prize: prizeAmount,
          message: `Congratulations! You won ₹${prizeAmount}!`
        });
      } else {
        res.status(200).json({ 
          score,
          message: "Score submitted successfully. Keep playing to win prizes!"
        });
      }
    } catch (error) {
      console.error("Submit score error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // LEADERBOARD ROUTES
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const topScores = await storage.getTopScores(limit);
      res.status(200).json(topScores);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ADMIN ROUTES
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from the response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Admin get transactions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
