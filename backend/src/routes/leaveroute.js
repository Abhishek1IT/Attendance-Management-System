import express from 'express';
import {
    applyLeave,
    myLeaves,
    getAllLeaves,
    updateLeaveStatus
} from '../controllers/leaveController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/apply', protect(), applyLeave);
router.get('/my', protect(), myLeaves);

// Admin side routes
router.get('/all', protect("Admin"), getAllLeaves);
router.put('/status/:id', protect("Admin"), updateLeaveStatus);

export default router;