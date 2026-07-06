const bcrypt = require("bcrypt");
const {findUserByEmail,createUser} = require("../models/userModel");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");


const registerUser = async (req, res) => {
    try {

        const {
            full_name,
            email,
            password
        } = req.body;

        // Validation
        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await createUser(
            full_name,
            email,
            password_hash
        );

        console.log(result);

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });

    }
};

const loginUser = async (req, res) => {
    try{
        const {email , password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message : "All fields are required"
            })
        }

        const user = await findUserByEmail(email);

        if(!user){
            return res.status(401).json({
                message : "Invalid email or password"
            })
        }

        const isMatch = await bcrypt.compare(
            password, 
            user.password_hash
        );

        if(!isMatch) {
            return res.status(401).json({
                message : "Invalid credentials"
            });
        }
        
        const token = generateToken(user.id);

        res.status(200).json({
            success : true,
            message : "User logged in successfully",
            token,
            user : {
                id : user.id,
                full_name : user.full_name,
                email : user.email
            }
        });
        
    } catch (err){
        console.error(err);
        return res.status(500).json({
            message : err.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};