const { UserPost } = require('../../db/models');

/**
 * @desc Update Post associations with authors through UserPost
 * @param postId:  required(Number)
 * @param userIds: required(Array<Number>)
 * @todo move to db/models/user_post.js
 * @todo check for unique authorIds
 * @todo make sure there is at least one author
 * */
const updateAssociationsHelper = async function (postId, userIds) {
  const currentAssociations = await UserPost.findAll({
    where: {
      postId,
    },
  });
  const currentAuthorIds = currentAssociations.map(
    (association) => association.userId
  );

  const toAdd = userIds.filter((id) => !currentAuthorIds.includes(id));
  const toRemove = currentAuthorIds.filter((id) => !userIds.includes(id));

  if (toAdd.length > 0) {
    await UserPost.bulkCreate(
      toAdd.map((id) => ({
        userId: id,
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
 * @param postId: required(Number)
 * @param values.authorIds: optional(Array<Number>)
 * @param values.text: optional(String)
 * @param values.tags: optional(Array<String>)
 * @returns {text: String, tags: Array<String>}
 */
const updateValuesHelper = async function (postId, values) {
  const { authorIds, text, tags } = values;
  const update = {};
  if (authorIds) {
    await updateAssociationsHelper(postId, authorIds);
  }
  if (tags) {
    update.tags = tags;
  }
  if (text) {
    update.text = text;
  }

  return update;
};

module.exports = { updateAssociationsHelper, updateValuesHelper };
