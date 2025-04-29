import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  fullName: text("full_name"),
  city: text("city"),
  isAdmin: boolean("is_admin").default(false),
  walletBalance: doublePrecision("wallet_balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  phone: true,
  password: true,
  fullName: true,
  city: true,
  isAdmin: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Game Schema
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  rating: doublePrecision("rating").default(0),
  prizeAmount: doublePrecision("prize_amount").default(0),
  isActive: boolean("is_active").default(true),
});

export const insertGameSchema = createInsertSchema(games).pick({
  name: true,
  description: true,
  category: true,
  imageUrl: true,
  rating: true,
  prizeAmount: true,
  isActive: true,
});

// Game Categories
export const gameCategories = pgTable("game_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  colorClass: text("color_class").notNull(),
});

export const insertGameCategorySchema = createInsertSchema(gameCategories).pick({
  name: true,
  icon: true,
  colorClass: true,
});

// Transaction Schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'game_entry', 'winning'
  description: text("description"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  status: true,
});

// Game Score Schema
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  score: integer("score").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  completed: boolean("completed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameScoreSchema = createInsertSchema(gameScores).pick({
  userId: true,
  gameId: true,
  score: true,
  timeSpent: true,
  completed: true,
});

// Trivia Questions Schema
export const triviaQuestions = pgTable("trivia_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  category: text("category"),
  difficulty: text("difficulty"),
});

export const insertTriviaQuestionSchema = createInsertSchema(triviaQuestions).pick({
  question: true,
  options: true,
  correctAnswer: true,
  category: true,
  difficulty: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type GameCategory = typeof gameCategories.$inferSelect;
export type InsertGameCategory = z.infer<typeof insertGameCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;

export type TriviaQuestion = typeof triviaQuestions.$inferSelect;
export type InsertTriviaQuestion = z.infer<typeof insertTriviaQuestionSchema>;
