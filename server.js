const express = require("express");
const postRouter = require("./blog/postRouter");
const server = express();

const cors = require("cors");

server.use(express.json());
server.use(cors());

server.use("/api/posts", postRouter);

server.get("/", (req, res) => {
  res.send(`<h1>This is Sparta!</h1><h2>Who are you?</h2>`);
});

module.exports = server;
