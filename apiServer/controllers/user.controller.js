import User from "../models/user.model.js"; // Adjust path to your model

export const createUser = async (req, res) => {
  try {
  //  fix this before production.
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // If you violate unique email or required fields, it catches here
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};