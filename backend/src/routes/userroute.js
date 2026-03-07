import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  deactivateUser,
} from "../controllers/userController.js";

const router = express.Router();
router.get("/me", protect(), getMyProfile);
router.get("/all", protect("Admin"), getAllUsers);
router.post("/role/:id", protect("Admin"), updateUserRole);

router.patch("/deactivate/:id", protect("Admin"), deactivateUser);
router.delete("/:id", protect("Admin"), deleteUser);

export default router;