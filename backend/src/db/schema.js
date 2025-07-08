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


