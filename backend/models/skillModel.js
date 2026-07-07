const db = require("../config/db");

const addSkill = async (user_id, skill_name, proficiency, description) => {
    const [result] = await db.execute(
        `INSERT INTO skills
        (user_id, skill_name, proficiency, description)
        VALUES (?, ?, ?, ?)`,
        [user_id, skill_name, proficiency, description]
    );

    return result;
};

const getSkillsByUser = async (user_id) => {
    const [rows] = await db.execute(
        `SELECT *
         FROM skills
         WHERE user_id = ?`,
        [user_id]
    );

    return rows;
};

const getAllSkills = async() => {
    const [rows] = await db.execute(
        "SELECT * FROM SKILLS ORDER BY skill_name"
    );
    return rows;
}

module.exports = {
    addSkill,
    getSkillsByUser,
    getAllSkills
};