const { UserPost } = require('../../db/models');

/**
 * @desc Update Post associations with authors through UserPost
 * @param postId:  required(Number)
 * @param userIds: required(Array<Number>)
 * @param ownerId: required(Number)
 * @todo move to db/models/user_post.js
 */
const updateAssociationsHelper = async function (post, userIds, ownerId) {
  const postId = post.id;
  const currentAssociations = await UserPost.findAll({
    where: {
      postId,
    },
  });
  const currentAuthorIds = currentAssociations.map(
    (association) => association.userId
  );

  const toAdd = userIds.filter((id) => !currentAuthorIds.includes(id));
  const toRemove = currentAuthorIds.filter(
    (id) => !userIds.includes(id) && id !== ownerId
  );

  if (toAdd.length > 0) {
    await UserPost.bulkCreate(
      toAdd.map((userId) => ({
        userId,
        postId,
      }))
    );
  }

  if (toRemove.length > 0) {
    await UserPost.destroy({
      where: {
        userId: toRemove,
        postId,
      },
    });
  }
};

/**
 * @brief Return hashmap of post updates
 * @param values.text: optional(String)
 * @param values.tags: optional(Array<String>)
 * @returns {text: String, tags: Array<String>}
 */
const updateValuesHelper = async function (values) {
  const { text, tags } = values;
  const update = {};

  if (tags) {
    update.tags = tags;
  }
  if (text) {
    update.text = text;
  }

  return update;
};

module.exports = { updateAssociationsHelper, updateValuesHelper };
