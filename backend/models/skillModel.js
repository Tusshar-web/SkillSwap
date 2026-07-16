const db = require("../config/db");

const addSkill = async (
    user_id,
    skill_name,
    skill_type,
    proficiency,
    description
) => {

    // Check if skill already exists
    const [existing] = await db.execute(
        "SELECT skill_id FROM skills WHERE skill_name = ?",
        [skill_name]
    );

    let skill_id;

    if (existing.length > 0) {
        skill_id = existing[0].skill_id;
    } else {

        // Create new skill
        const [result] = await db.execute(
            "INSERT INTO skills (skill_name) VALUES (?)",
            [skill_name]
        );

        skill_id = result.insertId;
    }

// Check if user already has this skill with the same type
const [existingUserSkill] = await db.execute(
    `SELECT user_skill_id
     FROM user_skills
     WHERE user_id = ?
     AND skill_id = ?
     AND skill_type = ?`,
    [
        user_id,
        skill_id,
        skill_type
    ]
);

if (existingUserSkill.length > 0) {
    throw new Error("Skill already exists.");
}

const [result] = await db.execute(
    `INSERT INTO user_skills
    (user_id, skill_id, skill_type, proficiency, description)
    VALUES (?, ?, ?, ?, ?)`,
    [
        user_id,
        skill_id,
        skill_type,
        proficiency,
        description
    ]
);

return result;
};


const getSkillsByUser = async (user_id) => {

    const [rows] = await db.execute(
        `
        SELECT
            us.user_skill_id,
            s.skill_name,
            us.skill_type,
            us.proficiency,
            us.description
        FROM user_skills us
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
        ORDER BY s.skill_name
        `,
        [user_id]
    );

    return rows;
};

const getAllSkills = async () => {

    const [rows] = await db.execute(
        `
        SELECT
            skill_id,
            skill_name
        FROM skills
        ORDER BY skill_name
        `
    );

    return rows;
};

const deleteUserSkill = async (userSkillId, userId) => {

    const [result] = await db.execute(
        `DELETE FROM user_skills
         WHERE user_skill_id = ?
         AND user_id = ?`,
        [userSkillId, userId]
    );

    return result;
};

const updateUserSkill = async (
    userSkillId,
    userId,
    skillType,
    proficiency,
    description
) => {

    const [result] = await db.execute(
        `UPDATE user_skills
         SET
            skill_type = ?,
            proficiency = ?,
            description = ?
         WHERE
            user_skill_id = ?
         AND user_id = ?`,
        [
            skillType,
            proficiency,
            description,
            userSkillId,
            userId
        ]
    );

    return result;
};

const getSkillById = async (userSkillId) => {

    const [rows] = await db.execute(
        `
        SELECT
            us.user_skill_id,
            s.skill_name,
            us.skill_type,
            us.proficiency,
            us.description
        FROM user_skills us
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE us.user_skill_id = ?
        `,
        [userSkillId]
    );

    return rows[0];
};

const searchSkills = async (keyword) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM skills
        WHERE skill_name LIKE ?
        ORDER BY skill_name
        LIMIT 10
        `,
        [`%${keyword}%`]
    );

    return rows;
};

module.exports = {
    addSkill,
    getSkillsByUser,
    getAllSkills,
    deleteUserSkill,
    updateUserSkill,
    getSkillById,
    searchSkills
};