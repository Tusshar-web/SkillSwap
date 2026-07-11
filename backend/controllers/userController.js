const {
  getUserById,
  updateUserProfile,
  getUserProfile,
} = require("../models/userModel");

const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const updateProfile = async (req, res) => {
    try {

        const {
            full_name,
            bio,
            location,
            profile_picture
        } = req.body;

        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: "Full name is required."
            });
        }

        const result = await updateUserProfile(
            req.user.id,
            full_name,
            bio ?? null,
            location ?? null,
            profile_picture ?? null
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
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
  getProfile,
  updateProfile,
  getMyProfile,
};
