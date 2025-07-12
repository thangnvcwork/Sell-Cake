import express from "express";
import Stripe from "stripe";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, ordersTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());

if (!ENV.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in env");
}

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

app.post("/api/create-payment-intent", async (req, res) => {
  const { userId, recipeId, amount, currency } = req.body;

  try {
    // 1. Tạo PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // ví dụ: 5000 = $50.00
      currency,
      payment_method_types: ["card"],
    });

    // 2. Lưu vào database
    await db.insert(ordersTable).values({
      userId,
      recipeId,
      amount,
      currency,
      paymentIntentId: paymentIntent.id,
      status: "pending",
    });

    // 3. Trả client_secret để frontend xác nhận thanh toán
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Tạo thanh toán thất bại" });
  }
});


app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
