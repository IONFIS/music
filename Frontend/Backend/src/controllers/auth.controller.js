import { User } from "../models/user.model.js";

export const authCallback = async (req, res) => {
    try {
      const { id, firstName, lastName, imageUrl, phoneNumber } = req.body;
  
      if (!id || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
  
      // Find user by clerkId
      let user = await User.findOne({ clerkId: id });
  
      if (user) {
        // Update existing user
        user.firstName = firstName;
        user.lastName = lastName;
        user.imageUrl = imageUrl;
        user.phoneNumber = phoneNumber;
        await user.save();
      } else {
        // Create new user if not found
        user = await User.create({
          clerkId: id,
          fullName: `${firstName || ""} ${lastName || ""}`.trim(),
          imageUrl,
          phoneNumber,
        });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("🔥 Error in authCallback:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  