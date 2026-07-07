const {getUserById} = require("../models/userModel");
const { updateUserProfile } = require("../models/userModel");

const getProfile = async (req, res) => {
    
    try {
        const user = await getUserById(req.user.id);
        if(!user) {
            return res.status(404).json({
                message : "User not found"
            });
        }

        res.status(200).json({
            success : true,
            user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message : err.message
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

        await updateUserProfile(
            req.user.id,
            full_name,
            bio,
            location,
            profile_picture
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};



module.exports = {
    getProfile,
    updateProfile
};

