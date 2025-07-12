import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const favoritesTable = pgTable("favorties", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  createAt: timestamp("created_at").defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),

  userId: text("user_id").notNull(), // từ Clerk
  recipeId: integer("recipe_id").notNull(), // công thức được mua

  amount: integer("amount").notNull(), // đơn vị là cent (Stripe yêu cầu)
  currency: text("currency").notNull().default("usd"),

  paymentIntentId: text("payment_intent_id").notNull(), // từ Stripe
  status: text("status").default("pending"), // pending | succeeded | failed

  createdAt: timestamp("created_at").defaultNow(),
});
