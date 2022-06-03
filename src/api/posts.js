const express = require('express');
const { Post, UserPost } = require('../db/models');

const router = express.Router();

/**
 * Create a new blog post
 * req.body is expected to contain {text: required(string), tags: optional(Array<string>)}
 */
router.post('/', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { text, tags } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ error: 'Must provide text for the new post' });
    }

    // Create new post
    const values = {
      text,
    };
    if (tags) {
      values.tags = tags.join(',');
    }
    const post = await Post.create(values);
    await UserPost.create({
      userId: req.user.id,
      postId: post.id,
    });

    res.json({ post });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc Get all posts by authorIds, sort by sortBy and order (asc or desc)
 * @params req.query is expected to contain:
 * {
 *  authorIds: required(string)),
 *  sortBy: optional(string) = 'id',
 *  order: optional(string) = 'asc'
 * }
 * @todo implement pagination (limit and offset)
 */
router.get('/', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { authorIds, sortBy, order } = req.query;

    if (!authorIds) {
      return res
        .status(400)
        .json({ error: 'Must provide authorIds for the posts' });
    }

    const authorIdsInt = authorIds.split(',').map(Number);

    const posts = await Post.getPostsByUserId(authorIdsInt, sortBy, order);

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
