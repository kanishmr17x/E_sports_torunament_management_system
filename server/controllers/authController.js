const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { asyncHandler, validateRequired, validateEmail, errorResponse, successResponse, sendResponse } = require("../middleware/centralizedErrorHandler");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Register User
exports.registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Strict validation
    const validation = validateRequired(['username', 'email', 'password'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse(validation.message, 400));
    }

    // Validate email format
    if (!validateEmail(email)) {
        return sendResponse(res, errorResponse("Please provide a valid email", 400));
    }

    // Validate password length
    if (password.length < 6) {
        return sendResponse(res, errorResponse("Password must be at least 6 characters", 400));
    }

    // Validate username length
    if (username.trim().length < 3) {
        return sendResponse(res, errorResponse("Username must be at least 3 characters", 400));
    }

    // Validate role
    const validRoles = ["player", "admin", "organizer"];
    if (role && !validRoles.includes(role)) {
        return sendResponse(res, errorResponse("Invalid role. Must be one of: " + validRoles.join(", "), 400));
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
        $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }] 
    });

    if (userExists) {
        if (userExists.email === email.toLowerCase().trim()) {
            return sendResponse(res, errorResponse("Email already registered", 409));
        }
        if (userExists.username === username.trim()) {
            return sendResponse(res, errorResponse("Username already taken", 409));
        }
    }

    // Create user with role
    const user = await User.create({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password, // will be hashed by pre-save hook
        role: role || "player"
    });
    
    sendResponse(res, successResponse("User registered successfully", {
        token: generateToken(user._id),
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    }, 201));
});

// Login User
exports.loginUser = asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;

    // Strict validation
    const validation = validateRequired(['emailOrUsername', 'password'], req.body);
    if (!validation.isValid) {
        return sendResponse(res, errorResponse("Email/Username and password required", 400));
    }

    // Find user by email or username
    const user = await User.findOne({
        $or: [
            { email: emailOrUsername.toLowerCase().trim() },
            { username: emailOrUsername.trim() }
        ]
    });

    if (!user) {
        return sendResponse(res, errorResponse("Invalid credentials", 401));
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
        return sendResponse(res, errorResponse("Invalid credentials", 401));
    }
    
    sendResponse(res, successResponse("Login successful", {
        token: generateToken(user._id),
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    }));
});

// Get Logged-in User Profile
exports.getProfile = asyncHandler(async (req, res) => {
    sendResponse(res, successResponse("Profile fetched successfully", req.user));
});
