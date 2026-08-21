import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { make_move, get_game, promote } from "./chess.js";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.json({
        message: "Chess API is running"
    });
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Index.html"));
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});


app.get("/api/game", (req,res) => {
    res.json(get_game());
})

app.post("/api/move", (req,res) => {
    const {from, to} = req.body;
    console.log("Move received: ", from, "->", to);
    const result = make_move(from, to);

    res.json(result);
});

app.post("/api/promote", (req, res) => {
    const { piece } = req.body;

    const result = promote(piece);

    res.json(result);
});
