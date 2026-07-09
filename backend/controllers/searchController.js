const { searchUsers } = require("../models/searchModel");

const searchUsersBySkill = async (req, res) => {
  try {
    const { skill, type } = req.query;

    if (!skill || !type) {
      return res.status(400).json({
        success: false,
        message: "Skill and type are required.",
      });
    }

    if (!["offer", "want"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'offer' or 'want'.",
      });
    }

    const users = await searchUsers(skill, type, req.user.id);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  searchUsersBySkill,
};
