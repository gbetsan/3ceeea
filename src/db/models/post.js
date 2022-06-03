const Sequelize = require('sequelize');
const db = require('../db');
const UserPost = require('./user_post');

const Post = db.define(
  'post',
  {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    likes: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    reads: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    popularity: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 1.0,
      },
    },
    tags: {
      // note: comma separated string since sqlite does not support arrays
      // todo: rewrite existing logic to support array setter
      // set(val) {
      //   this.setDataValue('tags',val.join(','));
      // },
      type: Sequelize.STRING,
      get() {
        return this.getDataValue('tags').split(',');
      },
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

/**
 * @desc Get all posts by authorIds, sort by sortBy and order (asc or desc)
 * @params userIds: required(Array<Number>),
 *         sortBy: optional(string),
 *         order: optional(string)
 */
Post.getPostsByUserId = async function (userIds, sortBy = 'id', order = 'asc') {
  return Post.findAll({
    include: [
      {
        model: UserPost,
        attributes: [],
        where: {
          userId: userIds,
        },
      },
    ],
    order: [[sortBy, order]],
  });
};

module.exports = Post;
