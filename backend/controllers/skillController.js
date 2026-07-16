const {
  addSkill: addSkillModel,
  getSkillsByUser,
  getAllSkills: getAllSkillsModel,
  getSkillById: getSkillByIdModel,
  deleteUserSkill: deleteUserSkillModel,
  updateUserSkill: updateUserSkillModel,
  searchSkills: searchSkillsModel,
} = require("../models/skillModel");


// Add Skill
const createSkill = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      skill_name,
      skill_type,
      proficiency,
      description,
    } = req.body;

    if (!skill_name || !skill_type) {
      return res.status(400).json({
        success: false,
        message: "Skill name and skill type are required.",
      });
    }

    if (!["offer", "want"].includes(skill_type)) {
      return res.status(400).json({
        success: false,
        message: "skill_type must be either 'offer' or 'want'.",
      });
    }

    await addSkillModel(
      userId,
      skill_name,
      skill_type,
      proficiency || "Beginner",
      description || ""
    );

    res.status(201).json({
      success: true,
      message: "Skill added successfully.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get Logged-in User Skills
const getMySkills = async (req, res) => {
  try {

    const skills = await getSkillsByUser(req.user.id);

    res.status(200).json({
      success: true,
      skills,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get All Skills
const getAllSkillsController = async (req, res) => {
  try {

    const skills = await getAllSkillsModel();

    res.status(200).json({
      success: true,
      skills,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Search Skills
const searchSkillsController = async (req, res) => {
  try {

    const keyword = req.query.q || "";

    const skills = await searchSkillsModel(keyword);

    res.status(200).json({
      success: true,
      skills,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Update Skill
const editSkill = async (req, res) => {
  try {

    const userSkillId = req.params.id;

    const {
      skill_type,
      proficiency,
      description,
    } = req.body;

    const skill = await getSkillByIdModel(userSkillId);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    await updateUserSkillModel(
      userSkillId,
      req.user.id,
      skill_type || skill.skill_type,
      proficiency || skill.proficiency || "Intermediate",
      description !== undefined ? description : (skill.description || "")
    );

    res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Delete Skill
const removeSkill = async (req, res) => {
  try {

    const result = await deleteUserSkillModel(
      req.params.id,
      req.user.id
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  createSkill,
  getMySkills,
  getAllSkillsController,
  searchSkillsController,
  editSkill,
  removeSkill,
};