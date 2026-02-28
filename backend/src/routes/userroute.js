import express from 'express';
import {
    getMyProfile,
    getAllUsers,
    updateUserRole
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect(), getMyProfile);
router.get('/all', protect("Admin"), getAllUsers);
router.put('/role/:id', protect("Admin"), updateUserRole);

export default router;