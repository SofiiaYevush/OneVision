import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { avatarUpload } from '../../shared/middleware/upload';
import { updateProfileDto } from './user.dto';
import * as ctrl from './user.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', ctrl.getMe);
router.patch('/me', validate(updateProfileDto), ctrl.updateMe);
router.post('/me/avatar', avatarUpload.single('avatar'), ctrl.uploadAvatar);
router.delete('/me', ctrl.deleteMe);

export default router;