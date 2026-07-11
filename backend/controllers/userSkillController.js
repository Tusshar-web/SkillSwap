const {
  addUserSkill: addUserSkillModel,
  skillExists,
  userAlreadyHasSkill,
  getUserSkills,
  updateUserSkill: updateUserSkillModel,
  deleteUserSkill: deleteUserSkillModel,
  getSkillByName,
  createSkill,
} = require("../models/userSkillModel");

const addUserSkill = async (req, res) => {
  try {
    let {
      skill_id,
      skill_name,
      skill_type,
      proficiency,
      description,
    } = req.body;

    // Trim skill name if provided
    if (skill_name) {
      skill_name = skill_name.trim().replace(/\s+/g, " ");
    }

    // Validation
    if ((!skill_id && !skill_name) || !proficiency) {
      return res.status(400).json({
        success: false,
        message: "Either skill_id or skill_name is required.",
      });
    }

    // Prevent empty skill names like "     "
    if (skill_name !== undefined && skill_name.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skill name cannot be empty.",
      });
    }

    if (!["offer", "want"].includes(skill_type)) {
      return res.status(400).json({
        success: false,
        message: "skill_type must be either 'offer' or 'want'.",
      });
    }

    let finalSkillId = skill_id;

    // User entered a new skill
    if (!finalSkillId) {
      const existingSkill = await getSkillByName(skill_name);

      if (existingSkill) {
        finalSkillId = existingSkill.skill_id;
      } else {
        finalSkillId = await createSkill(skill_name);
      }
    } else {
      // User selected an existing skill
      if (!(await skillExists(finalSkillId))) {
        return res.status(404).json({
          success: false,
          message: "Skill not found.",
        });
      }
    }

    // Prevent duplicate skills for the same user
    if (await userAlreadyHasSkill(req.user.id, finalSkillId)) {
      return res.status(409).json({
        success: false,
        message: "You have already added this skill.",
      });
    }

    await addUserSkillModel(
      req.user.id,
      finalSkillId,
      skill_type,
      proficiency,
      description || null
    );

    return res.status(201).json({
      success: true,
      message: "Skill added successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMySkills = async (req, res) => {
  try {
    const skills = await getUserSkills(req.user.id);

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateUserSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { proficiency, description } = req.body;

    if (!proficiency) {
      return res.status(400).json({
        success: false,
        message: "Proficiency is required.",
      });
    }

    const result = await updateUserSkillModel(
      id,
      req.user.id,
      proficiency,
      description || null
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteUserSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteUserSkillModel(id, req.user.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
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
  addUserSkill,
  getMySkills,
  updateUserSkill,
  deleteUserSkill,
};