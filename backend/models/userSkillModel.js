const db = require("../config/db");

const addUserSkill = async (
    user_id,
    skill_id,
    proficiency,
    description
) => {
    const [result] = await db.execute(
        `INSERT INTO user_skills
        (user_id, skill_id, proficiency, description)
        VALUES (?, ?, ?, ?)`,
        [
            user_id,
            skill_id,
            proficiency,
            description
        ]
    );

    return result;
};

const skillExists = async (skill_id) => {
    const [rows] = await db.execute(
        "SELECT skill_id FROM skills WHERE skill_id = ?",
        [skill_id]
    );

    return rows.length > 0;
};

const userAlreadyHasSkill = async (user_id, skill_id) => {
    const [rows] = await db.execute(
        `SELECT user_skill_id
         FROM user_skills
         WHERE user_id = ? AND skill_id = ?`,
        [user_id, skill_id]
    );

    return rows.length > 0;
};

const getUserSkills = async (user_id) => {
    const [rows] = await db.execute(
        `SELECT
            us.user_skill_id,
            s.skill_id,
            s.skill_name,
            us.proficiency,
            us.description,
            us.created_at
        FROM user_skills us
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
        ORDER BY s.skill_name`,
        [user_id]
    );

    return rows;
};

const updateUserSkill = async (
    user_skill_id,
    user_id,
    proficiency,
    description
) => {

    const [result] = await db.execute(
        `UPDATE user_skills
         SET proficiency = ?, description = ?
         WHERE user_skill_id = ?
         AND user_id = ?`,
        [
            proficiency,
            description,
            user_skill_id,
            user_id
        ]
    );

    return result;
};

const deleteUserSkill = async (user_skill_id, user_id) => {
    const [result] = await db.execute(
        `DELETE FROM user_skills
         WHERE user_skill_id = ?
         AND user_id = ?`,
        [user_skill_id, user_id]
    );

    return result;
};

module.exports = {
    addUserSkill,
    skillExists,
    userAlreadyHasSkill,
    getUserSkills,
    updateUserSkill,
    deleteUserSkill
};