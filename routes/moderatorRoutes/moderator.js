const router = require('express').Router();
const Moderator = require('../../models/Moderator');
const {
  updateModerator: updateValidation,
  idModerator: moderatorIdValidation,
} = require('../../middleware/joi_validation/moderator');
const {
  updateModerator,
  deleteModerator,
} = require('../../controllers/moderatorControllers/moderators');

// update moderator
router.put('/', updateValidation, updateModerator);

// delete moderator
router.delete('/', moderatorIdValidation, deleteModerator);

// get moderator
router.get('/', async (req, res) => {
  try {
    const moderator = await Moderator.find();
    res.status(200).json(moderator);
  } catch (err) {
    res.status(500).json('Internal Server Error');
  }
});

// exporting routes
module.exports = router;
