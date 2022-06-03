const express = require('express');
const { Post, UserPost } = require('../db/models');
const { updateValuesHelper } = require('./helpers/posts_helper');

const router = express.Router();

/**
 * Create a new blog post
 * req.body is expected to contain {text: required(string), tags: optional(Array<string>)}
 */
router.post('/', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authorized' });
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
 * @path /api/posts/
 * @method GET
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
      return res.status(401).json({ error: 'Not Authorized' });
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

/**
 * @path /api/posts/:postId
 * @method PATCH
 * @desc Patch a post by postId
 * @params req.body is expected to contain
 * {
 *    authorIds: optional(Array<Number>),
 *    tags: optional(Array<string>),
 *    text: optional(string),
 * }
 * @todo extract some logic to a separate helper functions
 * @todo improve error handling
 */
router.patch('/:postId', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authorized' });
    }

    const { postId } = req.params;
    const { authorIds, tags, text } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Must provide postId' });
    }

    const post = await Post.findOne({
      where: {
        id: postId,
      },
      include: [
        {
          model: UserPost,
          where: {
            userId: req.user.id,
          },
        },
      ],
    });

    // TODO: implement separate validation to see if user is allowed to edit post
    // and return 403 if not. Current implementation is more efficient.
    // // if user is not the owner of the post, return 403
    // if (postc.userPost.userId !== req.user.id) {
    //   return res.sendStatus(403);
    // }

    // Check if post exists
    if (!post) {
      return res
        .status(404)
        .json({ error: 'Post not found or not authorized to edit' });
    }

    // Update post
    const values = await updateValuesHelper(postId, { authorIds, tags, text });
    await post.update(values, {
      where: { id: postId },
    });

    // Serialize post
    const serialize = post.get({ plain: true });
    serialize.authorIds = authorIds;
    delete serialize.user_posts;
    res.json({ post: serialize });
  } catch (error) {
    console.log(error.name);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ error: 'Author not found' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(401).json({ error: 'Validation error' });
    }
    next(error);
  }
});

module.exports = router;
