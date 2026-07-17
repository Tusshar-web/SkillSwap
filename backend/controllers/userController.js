const {
  getUserById,
  updateUserProfile,
  getUserProfile,
  getUserOfferSkills
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

const getAllUsers = async (req, res) => {
  try {
    const db = require("../config/db");
    const [users] = await db.execute(
      `SELECT id, full_name, email, bio, location, profile_picture, created_at
       FROM users
       WHERE is_verified = 1 OR is_verified IS TRUE OR is_verified = '1'
       ORDER BY id ASC`
    );

    const [allSkills] = await db.execute(
      `SELECT us.user_skill_id, us.user_id, us.proficiency, us.description, us.skill_type, s.skill_name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id`
    );

    const formattedUsers = users.map((u) => {
      const userSkills = allSkills.filter((s) => s.user_id === u.id);
      const offered = userSkills
        .filter((s) => s.skill_type === "offer" || s.skill_type === "OFFER" || s.skill_type === "Offer")
        .map((s) => ({
          userSkillId: s.user_skill_id,
          name: s.skill_name,
          level: s.proficiency || "Intermediate",
          endorsements: Math.floor(Math.random() * 12) + 3,
          description: s.description || "",
        }));
      const wanted = userSkills
        .filter((s) => s.skill_type === "want" || s.skill_type === "WANT" || s.skill_type === "Want")
        .map((s) => ({
          userSkillId: s.user_skill_id,
          name: s.skill_name,
          level: s.proficiency || "Beginner",
          description: s.description || "",
        }));

      const initials = (u.full_name || "User")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const defaultSvg = `<svg viewBox="0 0 100 100" class="avatar-svg"><defs><linearGradient id="av-${u.id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4F46E5" /><stop offset="100%" stop-color="#7C3AED" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av-${u.id})"/><text x="50" y="58" font-size="28" font-weight="700" fill="#FFF" text-anchor="middle">${initials}</text></svg>`;

      return {
        id: "user-" + u.id,
        backendId: u.id,
        name: u.full_name,
        headline: u.bio || "Member at LearnLoop | Open to skill exchanges",
        avatar: u.profile_picture || defaultSvg,
        bio: u.bio || "Member at LearnLoop. Ready to exchange knowledge and connect with peers.",
        location: u.location || "Global Citizen",
        skillsOffered: offered,
        skillsWanted: wanted,
        rating: 5.0,
        reviewsCount: 0,
        exchangesCompleted: 0,
        badges: ["Active Learner", "Community Helper"],
        availability: "Flexible Schedule",
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getOfferSkills = async (req, res) => {

    try {

        const userId = req.params.userId;

        const skills = await getUserOfferSkills(userId);

        res.json({
            success: true,
            skills
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
  getProfile,
  updateProfile,
  getMyProfile,
  getAllUsers,
  getOfferSkills
};
