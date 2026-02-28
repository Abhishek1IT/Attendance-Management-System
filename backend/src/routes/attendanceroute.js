import express from 'express';
import { markAttendance, myAttendance, monthlyAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/mark', protect(), markAttendance);
router.get('/my', protect(), myAttendance);
router.get("/monthly-summary", protect(), monthlyAttendance);

export default router;