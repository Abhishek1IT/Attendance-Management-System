import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  deactivateUser,
} from "../controllers/userController.js";

const router = express.Router();
router.get("/all", protect("Admin"), getAllUsers);
router.post("/role/:id", protect("Admin"), updateUserRole);

router.patch("/deactivate/:id", protect("Admin"), deactivateUser);
router.delete("/:id", protect("Admin"), deleteUser);

export default router;