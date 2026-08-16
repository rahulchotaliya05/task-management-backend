import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
