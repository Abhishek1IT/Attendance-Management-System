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

        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        if (role && req.user.role.toLowerCase() !== role.toLowerCase()) {
          return res.status(403).json({
            message: `Access denied: Requires ${role} role`,
          });
        }

        next();
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } else {
      return res.status(401).json({ message: "No token provided" });
    }
  };
};