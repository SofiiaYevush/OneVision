import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { requireAuth } from '../../shared/middleware/auth';
import { authLimiter } from '../../shared/middleware/rateLimit';
import { registerDto, loginDto, forgotPasswordDto, resetPasswordDto } from './auth.dto';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register', authLimiter, validate(registerDto), ctrl.register);
router.post('/login', authLimiter, validate(loginDto), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordDto), ctrl.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordDto), ctrl.resetPassword);

export default router;