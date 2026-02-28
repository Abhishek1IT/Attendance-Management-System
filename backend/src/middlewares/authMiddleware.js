import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (role) => {
  return async (req, res, next) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        if (role && user.role !== role) {
          return res.status(403).json({
            message: `  Access denied: Requires ${role} role`,
          });
        }

        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        next();
      } catch (error) {
        console.log(error.message);
        return res.status(401).json({ message: "Invalid token" });
      }
    } else {
      return res.status(401).json({ message: "No token provided" });
    }
  };
};
