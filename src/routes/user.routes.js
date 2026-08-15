import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getAllUsers);

export default router;
