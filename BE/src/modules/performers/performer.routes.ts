import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { portfolioUpload } from '../../shared/middleware/upload';
import { createProfileDto, updateProfileDto, browseQueryDto } from './performer.dto';
import * as ctrl from './performer.controller';

const router = Router();

router.get('/', validate(browseQueryDto, 'query'), ctrl.browse);

router.use(requireAuth);

router.post('/', requireRole('performer'), validate(createProfileDto), ctrl.createMyProfile);
router.get('/me/profile', requireRole('performer'), ctrl.getMyProfile);
router.patch('/me/profile', requireRole('performer'), validate(updateProfileDto), ctrl.updateMyProfile);
router.post('/me/portfolio', requireRole('performer'), portfolioUpload.single('image'), ctrl.addPortfolioItem);
router.delete('/me/portfolio/:itemId', requireRole('performer'), ctrl.removePortfolioItem);

router.get('/:id', ctrl.getProfileById);

export default router;