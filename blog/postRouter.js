const express = require("express");
const db = require("../data/db");

const router = express.Router();

//ADD BLOG POST
router.post("/", (req, res) => {
  const post = req.body;
  if (!post.title || !post.contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post." });
  } else {
    db.insert(post)
      .then(id => res.status(201).json({ ...id, ...post }))
      .catch(err =>
        res.status(500).json({
          error: "There was an error while saving the post to the database."
        })
      );
  }
});

//ADD COMMENT
router.post("/:id/comments", (req, res) => {
  const postId = req.params.id;
  const comment = { ...req.body, post_id: postId };

  db.findById(postId).then(response => {
    if (response.length) {
      comment.text
        ? db
            .insertComment(comment)
            .then(commentId => {
              res.status(201).json({ ...comment, ...commentId });
            })
            .catch(err => {
              res.status(500).json({
                error:
                  "There was an error while saving the comment to the database."
              });
            })
        : res
            .status(400)
            .json({ errorMessage: "Please provide text for the comment." });
    } else {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist." });
    }
  });
});

//GET ALL POSTS
router.get("/", (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(err =>
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." })
    );
});

//GET SINGLE POST
router.get("/:id", (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      post.length
        ? res.status(201).json(post[0])
        : res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." })
    );
});

//GET COMMENTS
router.get("/:id/comments", (req, res) => {
  const postId = req.params.id;

  db.findById(postId).then(response => {
    response.length
      ? db
          .findPostComments(postId)
          .then(comments => {
            res.status(200).json(comments);
          })
          .catch(() => {
            res.status(500).json({
              error: "The comments information could not be retrieved."
            });
          })
      : res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
  });
});

//DELETE A POST
router.delete("/:id", (req, res) => {
  const postId = req.params.id;

  db.remove(postId)
    .then(deleted => {
      deleted
        ? res.status(204).end()
        : res.status(404).json({
            message: "The post with the speicified ID does not exist."
          });
    })
    .catch(() =>
      res.send(500).json({ error: "The post could not be removed." })
    );
});

//UPDATE A POST
router.put("/:id", (req, res) => {
  const postId = req.params.id;

  // yyyy-mm-dd hh:mm:ss
  const updated_at = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const updates = { ...req.body, updated_at };

  if (!updates.title || !updates.contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post."
    });
  } else {
    db.update(postId, updates)
      .then(updated => {
        updated
          ? res.status(200).json({ ...updates, id: postId })
          : res.status(404).json({
              error: "The post with the specified ID does not exist."
            });
      })
      .catch(err =>
        res
          .status(500)
          .json({ error: "The post information could not be modified." })
      );
  }
});

module.exports = router;
