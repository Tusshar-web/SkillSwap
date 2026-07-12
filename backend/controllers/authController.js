const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");
const { 
    findUserByEmail, 
    createUser, 
    saveOTP ,
    verifyOTP,
    markEmailVerified
} = require("../models/userModel");

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await createUser(full_name, email, password_hash);

    const otp = generateOTP();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await saveOTP(result.insertId, otp, expiry);

    await sendOTP(email, otp);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      email,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const verifyEmail = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const user = await verifyOTP(email, otp);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        if (new Date(user.otp_expiry) < new Date()) {

            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });

        }

        await markEmailVerified(user.id);

        return res.status(200).json({

            success: true,
            message: "Email verified successfully."

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

const resendOTP = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        }

        const user = await findUserByEmail(email);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        if (user.is_verified) {

            return res.status(400).json({
                success: false,
                message: "Email already verified."
            });

        }

        const otp = generateOTP();

        const expiry = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await saveOTP(
            user.id,
            otp,
            expiry
        );

        await sendOTP(
            user.email,
            otp
        );

        return res.status(200).json({

            success: true,
            message: "OTP sent successfully."

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
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP
};
