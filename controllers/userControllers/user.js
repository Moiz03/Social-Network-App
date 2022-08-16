/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const Post = require('../../models/Post');

// update user
const updateUser = async (req, res) => {
  try {
    // CASE HANDLE: if user not found
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    // if password is in req.body then hashed it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // if email present in req.body
    if (req.body.email) {
      // CASE HANDLE: if email is not unqiue
      const result = await User.findOne({ email: req.body.email });
      if (result) {
        return res.status(409).json('Email already exists');
      }
    }

    // deleting suerID from req.body as it's not part of the schema
    delete req.body.userId;

    // updating user
    const { _id, password, ...updatedUser } = (
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: req.body,
        },
        { new: true }
      )
    )._doc;

    // return success message and user information
    res.status(200).json({
      message: 'Account updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    // catching error
    return res.status(500).json('Internal Server Error');
  }
};

// delete user function
const deleteUser = async (req, res) => {
  try {
    // CASE HANDLE: if user not found
    // deleting user if found
    const user = await User.findByIdAndDelete(req.body.userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    // CASE HANDLE: deleting all post created by user
    await Post.deleteMany({ userId: req.body.userId });

    // return success message and userID of deleted user
    return res.status(200).json({
      message: 'User has been deleted successfully',
      userId: req.body.userId,
    });
  } catch (err) {
    // catching error
    return res.status(500).json('Internal Server Error');
  }
};

// get user function
const getUser = async (req, res) => {
  try {
    // CASE HANDLE: if user not found
    const user = await User.findOne({
      userName: req.params.username,
    });
    if (!user) {
      return res.status(404).json('User not found');
    }

    // fetching information
    const { userName, firstName, lastName, email } = user;

    // return sucess message with user information
    res.status(200).json({
      message: "User's information fetched successfully",
      user: {
        userName,
        firstName,
        lastName,
        email,
      },
    });
  } catch (err) {
    // catching error
    res.status(500).json('Internal Server Error');
  }
};

// follow user function
const followUser = async (req, res) => {
  try {
    // CASE HANDLE: if user not found
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    // CASE HANDLE: if user not found to whom user want to follow
    const followUser = await User.findOne({ userName: req.params.username });
    if (!followUser) {
      return res.status(404).json('User not found who you want to follow');
    }

    // CASE HANDLE: if user want to follow itself
    if (user.userName !== followUser.userName) {
      // CASE HANDLE: if user already following
      if (!user.followings.includes(followUser.userName)) {
        // updaing following list
        await user.updateOne({ $push: { followings: followUser.userName } });

        // return success message with username and following username
        res.status(200).json({
          message: 'User has been followed',
          data: {
            userName: user.userName,
            following_to: followUser.userName,
          },
        });
      } else {
        res.status(409).json('You already follow this user');
      }
    } else {
      res.status(403).json('You cannot follow yourself');
    }
  } catch (err) {
    // catching error
    res.status(500).json('Internal Server Error');
  }
};

// unfollow user function
const unfollowUser = async (req, res) => {
  try {
    // CASE HANDLE: if user not found
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json('user not found');
    }

    // CASE HANDLE: if user not found to whom user want to unfollow
    const unfollowUser = await User.findOne({ userName: req.params.username });
    if (!unfollowUser) {
      return res.status(404).json('user not found who you want to unfollow');
    }

    // CASE HANDLE: if user want to unfollow itself
    if (user.userName !== unfollowUser.userName) {
      // CASE HANDLE: if user already not following
      if (user.followings.includes(unfollowUser.userName)) {
        // updaing following list
        await user.updateOne({ $pull: { followings: unfollowUser.userName } });
        // return success message with username and unfollowing username
        res.status(200).json({
          message: 'User has been unfollowed',
          data: {
            userName: user.userName,
            unfollowing_to: unfollowUser.userName,
          },
        });
      } else {
        res.status(409).json('This user is not in your followings');
      }
    } else {
      res.status(403).json('You cannot unfollow yourself');
    }
  } catch (err) {
    // catching error
    res.status(500).json('Internal Server Error');
  }
};

// exporting fucntions
module.exports = { updateUser, deleteUser, getUser, followUser, unfollowUser };
