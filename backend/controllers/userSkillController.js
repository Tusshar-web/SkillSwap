const {
    addUserSkill: addUserSkillModel,
    skillExists,
    userAlreadyHasSkill,
    getUserSkills,
    updateUserSkill: updateUserSkillModel,
    deleteUserSkill: deleteUserSkillModel
} = require("../models/userSkillModel");

const addUserSkill = async (req, res) => {
    try {

        const {
            skill_id,
            proficiency,
            description
        } = req.body;

        if (!skill_id || !proficiency) {
            return res.status(400).json({
                success: false,
                message: "Skill and proficiency are required."
            });
        }

        // Check if the skill exists
        if (!(await skillExists(skill_id))) {
            return res.status(404).json({
                success: false,
                message: "Skill not found."
            });
        }

        // Check if user already has this skill
        if (await userAlreadyHasSkill(req.user.id, skill_id)) {
            return res.status(409).json({
                success: false,
                message: "You have already added this skill."
            });
        }

        await addUserSkillModel(
            req.user.id,
            skill_id,
            proficiency,
            description
        );

        return res.status(201).json({
            success: true,
            message: "Skill added successfully."
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getMySkills = async (req, res) => {
    try {

        const skills = await getUserSkills(req.user.id);

        return res.status(200).json({
            success: true,
            count: skills.length,
            data: skills
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const updateUserSkill = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            proficiency,
            description
        } = req.body;

        if (!proficiency) {
            return res.status(400).json({
                success: false,
                message: "Proficiency is required."
            });
        }

        const result = await updateUserSkillModel(
            id,
            req.user.id,
            proficiency,
            description
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found or unauthorized."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const deleteUserSkill = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await deleteUserSkillModel(
            id,
            req.user.id
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found or unauthorized."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skill deleted successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

module.exports = {
    addUserSkill,
    getMySkills,
    updateUserSkill,
    deleteUserSkill
};