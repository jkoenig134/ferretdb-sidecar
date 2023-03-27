import { MongoDbConnection } from "@js-soft/docdb-access-mongo";
import express from "express";

const connection = await new MongoDbConnection("mongodb://ferretdb:27017").connect();
const db = await connection.getDatabase("ferret");
const collection = await db.getCollection("todos");

const app = express();
app.use(express.json());

app.get("/todos", async (_, res) => {
    const todos = await collection.find();
    res.status(200).send(todos);
});

app.get("/todos/:id", async (req, res) => {
    const id = req.params.id;
    const todo = await collection.findOne({ id });

    if (!todo) {
        res.status(404).send("Not found");
        return;
    }

    res.status(200).send(todo);
});

app.put("/todos/:id/toggle", async (req, res) => {
    const id = req.params.id;
    const todo = await collection.findOne({ id });

    if (!todo) {
        res.status(404).send("Not found");
        return;
    }

    const updated = await collection.update({ id }, { ...todo, done: !todo.done });
    res.status(200).send(updated);
});

app.post("/todos", async (req, res) => {
    const id = Math.random().toString(36).substring(7);

    if (!req.body || !req.body.title || !req.body.description || typeof req.body.done === "undefined") {
        res.status(400).send("Invalid request");
        return;
    }

    const todo = { id, title: req.body.title, description: req.body.description, done: req.body.done };

    await collection.create(todo);

    res.status(201).send(todo);
});

app.use((_, res) => res.status(404).send("Not found"));

app.listen(3000, () => console.log("Server started"));
