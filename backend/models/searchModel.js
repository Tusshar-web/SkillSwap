const db = require("../config/db");

const searchUsers = async (skill, type, currentUserId) => {

    const [rows] = await db.execute(
        `SELECT
            u.id,
            u.full_name,
            u.location,
            u.profile_picture,
            s.skill_name,
            us.proficiency,
            us.description
        FROM users u
        JOIN user_skills us
            ON u.id = us.user_id
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE LOWER(s.skill_name) LIKE LOWER(?)
          AND us.skill_type = ?
          AND u.id != ?
          AND (u.is_verified = 1 OR u.is_verified IS TRUE OR u.is_verified = '1')
        ORDER BY u.full_name`,
        [
            `%${skill}%`,
            type,
            currentUserId
        ]
    );

    return rows;
};

module.exports = {
    searchUsers
};