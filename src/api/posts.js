const express = require('express');
const { Post, UserPost } = require('../db/models');
const {
  updateValuesHelper,
  updateAssociationsHelper,
} = require('./helpers/posts_helper');
const { Validator } = require('express-json-validator-middleware');

const router = express.Router();
const { validate } = new Validator();

const getPostsSchema = require('../schema/posts/get_posts.json');
const patchPostsSchema = require('../schema/posts/patch_posts.json');

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
 * @desc Get all posts by authorIds, sort by sortBy and direction (asc or desc)
 * @params see corresponding schema
 * @todo implement pagination (limit and offset)
 */
router.get('/', validate(getPostsSchema), async (req, res, next) => {
  try {
    // Authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authorized' });
    }

    const { authorIds, sortBy, direction } = req.query;

    if (!authorIds) {
      return res
        .status(400)
        .json({ error: 'Must provide authorIds for the posts' });
    }

    const authorIdsInt = authorIds.split(',').map(Number);

    const posts = await Post.getPostsByUserId(authorIdsInt, sortBy, direction);

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

/**
 * @path /api/posts/:postId
 * @method PATCH
 * @desc Patch a post by postId
 * @params see corresponding schema
 * @todo extract some logic to a separate helper functions
 * @todo improve error handling
 */
router.patch('/:postId', validate(patchPostsSchema), async (req, res, next) => {
  try {
    // Authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authorized' });
    }

    const { postId } = req.params;
    const { authorIds, tags, text } = req.body;

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

    // Check if post exists
    if (!post) {
      return res
        .status(404)
        .json({ error: 'Post not found or not authorized to edit' });
    }

    // Update post
    if (authorIds) {
      await updateAssociationsHelper(post, authorIds, req.user.id);
    }
    const values = await updateValuesHelper({ tags, text });
    if (values.text || values.tags) {
      await post.update(values);
    }

    // Serialize post
    const serialize = post.get({ plain: true });

    let userposts = await UserPost.findAll({
      where: {
        postId,
      },
      attributes: ['userId'],
    });
    serialize.authorIds = userposts.map((userpost) => userpost.userId);
    // const date = new Date();
    // serialize.updatedAt = date.toISOString();

    delete serialize.user_posts;
    res.json({
      post: serialize,
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ error: 'Author not found' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error' });
    }
    next(error);
  }
});

module.exports = router;
