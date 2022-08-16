const Post = require('../../models/Post');
const Moderator = require('../../models/Moderator');

// controller function

// moderator feed function
const feedModerator = async (req, res) => {
  try {
    // checking query params, if not present then assigning default values
    const page = parseInt(req.query.page, 10) - 1 || 0;
    const limit = parseInt(req.query.limit, 10) || 5;
    const sortBy = req.query.sort || 'date';
    const sortQuery = {};
    sortQuery[sortBy] = sortBy === 'date' ? -1 : 1;

    // CASE HANDLE: if moderator not found
    const moderator = await Moderator.findById(req.body.moderatorId);
    if (!moderator) {
      return res.status(404).json('Moderator not found');
    }

    // fetching all posts according to query params without userId and userName
    const posts = await Post.find()
      .select('-userId -userName')
      .sort(sortQuery)
      .skip(page * limit)
      .limit(limit);

    // return success message and all posts
    return res.status(200).json({
      message: 'All posts are fetched successfully',
      params: { page, limit, sortBy },
      allPosts: posts,
    });
  } catch (err) {
    // cathcing an error
    return res.status(500).json('Internal Server Error');
  }
};

// exporting function
module.exports = { feedModerator };
