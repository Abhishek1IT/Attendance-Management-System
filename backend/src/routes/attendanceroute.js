import express from 'express';

import { markAttendance,
         myAttendance, 
         monthlyAttendance, 
         getAllAttendance, 
         updateAttendance
        } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/mark', protect(), markAttendance);
router.get('/my', protect(), myAttendance);
router.get("/monthly-summary", protect(), monthlyAttendance);

// Admin side routes
router.get("/all", protect("Admin"), getAllAttendance);
router.put("/update/:id", protect("Admin"), updateAttendance);

export default router;