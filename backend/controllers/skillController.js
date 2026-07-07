const {
    addSkill: addSkillModel,
    getSkillsByUser,
    getAllSkills: getAllSkillsModel
} = require("../models/skillModel");

const addSkill = async (req, res) => {
    try {
        const { skill_name, proficiency, description } = req.body;

        if (!skill_name || !proficiency) {
            return res.status(400).json({
                success: false,
                message: "Skill name and proficiency are required"
            });
        }

        await addSkillModel(
            req.user.id,
            skill_name,
            proficiency,
            description
        );

        return res.status(201).json({
            success: true,
            message: "Skill added successfully"
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

        const skills = await getSkillsByUser(req.user.id);

        return res.status(200).json({
            success: true,
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


const getAllSkills = async (req, res) => {
    try {
        const skills = await getAllSkillsModel();

        return res.status(200).json({
            success: true,
            data: skills
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    addSkill,
    getMySkills, 
    getAllSkills
};