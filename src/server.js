import express, { response } from "express"
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { eq, and } from "drizzle-orm";




const app = express()
const PORT = ENV.PORT || 5001;

app.use(express.json())

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true });
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {

    try {

        const { userId, recipeId } = req.params;

        await db

            .delete(favoritesTable)
            .where(
                and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
            );

        res.status(200).json({ message: "Favorite Removed Successfully" });

    } catch (error) {
        console.log("Error Removing a Favorite", error);
        res.status(500).json({ error: "Something went wrong" })
    }
});

app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;

        if (!userId || !recipeId || !title) {

            return res.status(400).json({ error: "Missing required fields" });
        }

        const newFavorite = await db.insert(favoritesTable).values(
            {
                userId,
                recipeId,
                title,
                image,
                cookTime,
                servings,
            }
        )
            .returning();

        res.status(201).json(newFavorite[0])


    } catch (error) {
        console.log("Error Adding Favorite", error);
        res.status(500).json({ error: "Something went wrong" })
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

        console.log("Error Fetvhing The Favorite", error);
        res.status(500).json({ error: "Something went wrong" })

    }
});

app.listen(PORT, () => {

    console.log("server is running on PORT", PORT);
})